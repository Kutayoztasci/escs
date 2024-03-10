const express = require('express');
const e = require("express");
const fetchDataFromApi = require('../abiosApi');
const gameData = require("../gameData");
const router = express.Router();
let endpoint = ''


router.get('/players/:game', async (req, res) => {
    try {
        const gameId = gameData.validateGameId(req.params.game, res);
        if (!gameId) return;

        endpoint = `/players?filter=game.id=${gameId}`;
        const data = await fetchDataFromApi(endpoint, req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
