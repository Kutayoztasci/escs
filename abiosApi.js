const axios = require('axios');
const config = require("./config");
const apiUrl = config.apiUrl;
const secret = config.secretKey;

async function fetchDataFromApi(endpoint, req) {
    try {
        const response = await axios.get(apiUrl + endpoint, {
            headers: {
                'Abios-Secret': secret,
                Authorization: req.headers.authorization
            },
            params: req.query
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching data from API:', error);
        throw error;
    }
}

module.exports = fetchDataFromApi;