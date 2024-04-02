const express = require('express');
const e = require("express");
const fetchDataFromApi = require('../abiosApi');
const gameData = require("../gameData");
const router = express.Router();
let endpoint = ''


router.get('/players/:game/:id?/:optional?', async (req, res) => {
    try {
        const url = gameData.validateGameId(req.params.game, res, req.params.id, req.params.optional);
        if (!url) return;

        endpoint = `/players` + url;
        const data = await fetchDataFromApi(endpoint, req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/playerById/:id', async (req, res) => {
    try {

        const endpoint = `/players/${req.params.id}`;
        const data = await fetchDataFromApi(endpoint, req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/playerByName/:game/:name', async (req, res) => {
    try {
        const gameId = gameData.validateGameId(req.params.game, res);
        if (!gameId) return;

        const endpoint = `/players${gameId}&filter=nick_name=${req.params.name}`;
        const data = await fetchDataFromApi(endpoint, req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
