const express = require('express');
const e = require("express");
const gameData = require("../gameData");
const fetchDataFromApi = require('../abiosApi');
const router = express.Router();
let endpoint = ''

router.get('/upComingEvents/:game/:id', async (req, res) => {
    try {
        const gameId = gameData.validateGameId(req.params.game, res);
        if (!gameId) return;

        const endpoint = `/teams/${req.params.id}/series${gameId}&filter=lifecycle=upcoming`;
        const data = await fetchDataFromApi(endpoint, req);

        var eventList = await collectEvents(data, req);

        res.json(eventList);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/series/:id', async (req, res) => {
    try {

        const endpoint = `/series/${req.params.id}`;
        const data = await fetchDataFromApi(endpoint, req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/tournaments/:id', async (req, res) => {
    try {

        const endpoint = `/tournaments/${req.params.id}`;
        const data = await fetchDataFromApi(endpoint, req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/tournamentParticipants/:id', async (req, res) => {
    try {

        const endpoint = `/tournaments/${req.params.id}/participants`;
        const data = await fetchDataFromApi(endpoint, req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/oldEvents/:game/:id', async (req, res) => {
    try {
        const gameId = gameData.validateGameId(req.params.game, res);
        if (!gameId) return;

        const endpoint = `/teams/${req.params.id}/series${gameId}&filter=lifecycle=over`;
        const data = await fetchDataFromApi(endpoint, req);

        var eventList = await collectEvents(data, req);

        res.json(eventList);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

async function collectEvents(data, req) {
    var idList = [];
    var responseDataList = [];


    data.forEach(item => {
            idList.push(item.tournament.id);
    });

    for (const id of idList) {
        var event = await getEvent(id, req);
        responseDataList.push(event);
    }

    return responseDataList;
}

async function getEvent(id, req) {
    try {
        endpoint = `/tournaments/${id}`;
        const response = await fetchDataFromApi(endpoint, req);
        return response;
    } catch (error) {
        console.error(`${error}`);
    }
}

module.exports = router;
