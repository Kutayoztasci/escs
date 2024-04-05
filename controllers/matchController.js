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

router.get('/liveMatches/:game', async (req, res) => {
    try {
        const gameId = gameData.validateGameId(req.params.game, res);
        if (!gameId) return;

        endpoint = `/matches${gameId}&filter=lifecycle=live`;
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

async function collectMatches(data, req) {
    var idList = [];
    var responseDataList = [];


    data.forEach(item => {
        item.matches.forEach(match => {
            idList.push(match.id);
        });
    });

    for (const id of idList) {
        var match = await getMatches(id, req);
        responseDataList.push(match);
    }

    return responseDataList;
}

async function getMatches(id, req) {
    try {
        endpoint = `/matches/${id}`;
        const response = await fetchDataFromApi(endpoint, req);
        return response;
    } catch (error) {
        console.error(`${error}`);
    }
}

module.exports = router;
