const express = require('express');
const e = require("express");
const fetchDataFromApi = require('../abiosApi');
const gameData = require("../gameData");
const router = express.Router();
let endpoint = ''


router.get('/teams/:game/:id?/:optional?', async (req, res) => {
    try {
        const url = gameData.validateGameId(req.params.game, res, req.params.id, req.params.optional);
        if (!url) return;

        endpoint = `/teams` + url;
        const data = await fetchDataFromApi(endpoint, req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/teamById/:id', async (req, res) => {
    try {

        const endpoint = `/teams/${req.params.id}`;
        const data = await fetchDataFromApi(endpoint, req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/teamByName/:game/:name', async (req, res) => {
    try {
        const gameId = gameData.validateGameId(req.params.game, res);
        if (!gameId) return;

        const endpoint = `/teams${gameId}&filter=name~=*${req.params.name}*`;
        const data = await fetchDataFromApi(endpoint, req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/teamRosters/:id', async (req, res) => {
    try {

        const endpoint = `/teams/${req.params.id}/rosters`;
        const data = await fetchDataFromApi(endpoint, req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/rosters/:id', async (req, res) => {
    try {

        const endpoint = `/rosters/${req.params.id}`;
        const data = await fetchDataFromApi(endpoint, req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
