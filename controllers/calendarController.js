const express = require('express');
const gameData = require("../gameData");
const e = require("express");
const fetchDataFromApi = require('../abiosApi');
const router = express.Router();
let endpoint = ''



router.get('/game', async (req, res) => {
    try {
        endpoint = '/games';
        const data = await fetchDataFromApi(endpoint, req);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;