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


module.exports = router;
