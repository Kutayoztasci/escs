const express = require('express');
const e = require("express");
const gameData = require("../gameData");
const fetchDataFromApi = require('../abiosApi');
const { wss, clients } = require('../liveWebsocketServer');
const router = express.Router();
let endpoint = ''

const WebSocket = require('ws');

router.get('/upcomingSeries/:game', async (req, res) => {
    try {
        const gameId = gameData.validateGameId(req.params.game, res);
        if (!gameId) return;

        const endpoint = `/series${gameId}&filter=end=null&order=start-asc`;
        const data = await fetchDataFromApi(endpoint, req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/matches/:game', async (req, res) => {
    try {
        const gameId = gameData.validateGameId(req.params.game, res);
        if (!gameId) return;

        const endpoint = `/matches${gameId}`;
        const data = await fetchDataFromApi(endpoint, req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/matchDetail/:id', async (req, res) => {
    try {
        const endpoint = `/matches/${req.params.id}/postgame/server/summary`;
        const data = await fetchDataFromApi(endpoint, req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/matchById/:id', async (req, res) => {
    try {
        const endpoint = `/matches/${req.params.id}`;
        const data = await fetchDataFromApi(endpoint, req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/liveMatches/:game', async (req, res) => {
    try {
        const gameId = gameData.validateGameId(req.params.game, res);
        if (!gameId) return;

        const endpoint = `/matches${gameId}&filter=lifecycle=live`;
        const data = await fetchDataFromApi(endpoint, req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

/*router.get('/liveMatchDetails/:game/:id', async (req, res) => {
    try {
        const gameId = gameData.validateGameId(req.params.game, res);
        if (!gameId) return;

        endpoint = `/matches/${req.params.id}`;
        const coverage = await fetchDataFromApi(endpoint, req);

        switch (true) {
            case coverage.coverage.data.realtime.api.expectation === "available":
                endpoint = `/matches/${req.params.id}/realtime/api/summary`;
                break;
            case coverage.coverage.data.live.api.expectation === "available":
                endpoint = `/matches/${req.params.id}/live/api/summary`;
                break;
            case coverage.coverage.data.live.cv.expectation === "available":
                endpoint = `/matches/${req.params.id}/live/cv/summary`;
                break;
            default:
                throw new Error("Canlı veri mevcut değil.");
        }

        const matchDetail = await fetchDataFromApi(endpoint, req);

        res.json(matchDetail);
    } catch (error) {
        res.status(500).json(error);
    }
});*/

router.get('/liveMatchDetails/:game/:id', async (req, res) => {
    try {
        const { game, id } = req.params;
        startLiveUpdates(game, id);
        res.json({ message: 'Live updates started via WebSocket' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/upComingMatches/:game/:id', async (req, res) => {
    try {
        const gameId = gameData.validateGameId(req.params.game, res);
        if (!gameId) return;

        const endpoint = `/teams/${req.params.id}/series${gameId}&filter=lifecycle=upcoming`;
        const data = await fetchDataFromApi(endpoint, req);

        var matchesList = await collectMatches(data, req);

        res.json(matchesList);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/oldMatches/:game/:id', async (req, res) => {
    try {
        const gameId = gameData.validateGameId(req.params.game, res);
        if (!gameId) return;

        const endpoint = `/teams/${req.params.id}/series${gameId}&filter=lifecycle=over&order=start-desc`;
        const data = await fetchDataFromApi(endpoint, req);
        var take;
        if(req.query.take !== undefined && req.query.take !== null){
            take = req.query.take;
        }else{
            take = 50;
        }
        var matchesList = await collectMatches(data, req, take);

        res.json(matchesList);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/playerMatches/:id', async (req, res) => {
    try {

        const endpoint = `/players/${req.params.id}/standingrosters`;
        const rosters = await fetchDataFromApi(endpoint, req);
        var matchesList = await matchesWithRosters(rosters, req);
        res.json(matchesList);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

async function collectMatches(data, req, take) {
    var idList = [];
    var matches;
    let count = 0;

    data.forEach(item => {
        item.matches.forEach(match => {
            if (count < take) {
                idList.push(match.id);
                count++;
            }
        });
    });

    if(take<50){
        const idString = idList.join(',');
        matches = await getMatchesById(idString, req);
    }else{
        const chunkSize = 50;
        for (let i = 0; i < idList.length; i += chunkSize) {
            const chunk = idList.slice(i, i + chunkSize);
            const idString = chunk.join(',');
            matches.push(await getMatchesById(idString, req));
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
    
    return matches;
}

async function getMatchesById(id, req) {
    try {
        endpoint = `/matches?filter=id<={${id}}`;
        const response = await fetchDataFromApi(endpoint, req);
        return response;
    } catch (error) {
        console.error(`${error}`);
    }
}

async function matchesWithRosters(data, req, take) {
    var idList = [];
    let count = 0;
    var match;

    for (const item of data) {
        if(item !== undefined && item !== null && item.roster !== undefined && item.roster !== null){
            if (item.roster.id !== undefined && item.roster.id !== null){
                if (count < take){
                    idList.push(item.roster.id);
                    count++;
                }   
            }
        }
    }

    if(take<50){
        const idString = idList.join(',');
        match = await getMatchesByRoster(idString, req);
    }else{
        const chunkSize = 50;
        for (let i = 0; i < ids.length; i += chunkSize) {
            const chunk = ids.slice(i, i + chunkSize);
            const idString = chunk.join(',');
            match.push(await getMatchesByRoster(idString, req));
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    return match;
}

async function getMatchesByRoster(id, req) {
    try {
        endpoint = `/matches?filter=participants.roster.id^{${id}}`;
        const response = await fetchDataFromApi(endpoint, req);
        return response;
    } catch (error) {
        console.error(`${error}`);
    }
}

function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

async function checkLiveForUpdates(game, id) {
    const gameId = gameData.validateGameId(game);
    if (!gameId) return;

    let endpoint = `/matches/${id}`;
    const coverage = await fetchDataFromApi(endpoint, { headers: {} });

    switch (true) {
        case coverage.coverage.data.realtime.api.expectation === "available":
            endpoint = `/matches/${id}/realtime/api/summary`;
            break;
        case coverage.coverage.data.live.api.expectation === "available":
            endpoint = `/matches/${id}/live/api/summary`;
            break;
        case coverage.coverage.data.live.cv.expectation === "available":
            endpoint = `/matches/${id}/live/cv/summary`;
            break;
        default:
            throw new Error("Canlı veri mevcut değil.");
    }

    const matchDetail = await fetchDataFromApi(endpoint, { headers: {} });

    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(matchDetail));
        }
    });
}

function startLiveUpdates(game, id) {
    setInterval(async () => {
        if (clients.size > 0) {
            try {
                await checkLiveForUpdates(game, id);
            } catch (error) {
                console.error(`Error checking live updates for game ${game} and match ${id}: ${error.message}`);
            }
        }
    }, 5000);
}

module.exports = router;
