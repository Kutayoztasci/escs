const gameData = {
    gameIds: {
        cs: 5,
        valorant: 20
    }
};

function validateGameId(gameName, res) {
    const game = gameName.toLowerCase();
    const gameId = gameData.gameIds[game];

    if (!gameId) {
        res.status(404).json({ error: 'Game not found' });
        return false;
    }

    return gameId;
}

module.exports = { gameData, validateGameId };
