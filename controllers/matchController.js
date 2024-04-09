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

        /*matchesList.sort(function(a,b) {
            return new Date(a.created_at) - new Date(b.created_at);
        });

        matchesList.forEach(function(abcdf){
            console.log(abcdf);
        });
        */
        res.json(matchesList);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

function dateSort(a, b){
    if (!a.created_at || !b.created_at) {
        return 0;
    }
    var a = Date.parse(a.created_at.substring(0,23) + a.created_at.substring(26));
    var b = Date.parse(b.created_at.substring(0,23) + b.created_at.substring(26));
    return new Date(b).getTime() - new Date(a).getTime();
    }

async function collectMatches(data, req) {
    var idList = [];
    var responseDataList = [];

    data.forEach(item => {
        item.matches.forEach(match => {
            idList.push(match.id);
        });
    });

    for (const id of idList) {
        var match = await getMatchesById(id, req);
        responseDataList.push(match);
    }

    return responseDataList;
}

async function getMatchesById(id, req) {
    try {
        endpoint = `/matches/${id}`;
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

module.exports = router;
