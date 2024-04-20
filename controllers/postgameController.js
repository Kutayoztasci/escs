const express = require('express');
const gameData = require("../gameData");
const e = require("express");
const fetchDataFromApi = require('../abiosApi');
const router = express.Router();
let endpoint = ''


router.get('/matchDetail/:id', async (req, res) => {
    try {
        endpoint = `/matches/${req.params.id}/postgame/server/summary`;
        const data = await fetchDataFromApi(endpoint, req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/matchRounds/:id', async (req, res) => {
    try {
        endpoint = `/matches/${req.params.id}/postgame/server/summary/rounds`;
        const data = await fetchDataFromApi(endpoint, req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;