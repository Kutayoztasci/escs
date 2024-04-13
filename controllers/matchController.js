const express = require('express');
const e = require("express");
const gameData = require("../gameData");
const fetchDataFromApi = require('../abiosApi');
const router = express.Router();
let endpoint = ''

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

        const endpoint = `/teams/${req.params.id}/series${gameId}&filter=lifecycle=over`;
        const data = await fetchDataFromApi(endpoint, req);
        /*var take;
        if(req.query.take !== undefined && req.query.take !== null){
            take = req.query.take;
        }else{
            take = 50;
        }*/
        var matchesList = await collectMatches(data, req);

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

async function collectMatches(data, req) {
    var idList = [];
    var responseDataList = [];

    data.forEach(item => {
        item.matches.forEach(match => {
            idList.push(match.id);
        });
    });

    const chunkedIds = chunkArray(idList, 20);
    for (const chunk of chunkedIds) {
        const idString = chunk.join(',');
        const matches = await getMatchesById(idString, req);
        if (matches !== undefined && matches !== null && matches.length !== 0) {
            responseDataList.push(matches);
        }
    }

    /*for (const id of idList) {
        var match = await getMatchesById(id, req);
        if (match !== undefined && match !== null && match.length !== 0){
            responseDataList.push(match);

        }
    }*/

    return responseDataList;
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

async function matchesWithRosters(data, req) {
    var responseDataList = [];

    for (const item of data) {
        var match = await getMatchesByRoster(item.roster.id, req);
        if (match !== undefined && match !== null && match.length !== 0){
            responseDataList.push(match);

        }
    }

    return responseDataList;
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

module.exports = router;
