const gameData = {
    gameIds: {
        cs: 5,
        valorant: 20
    }
};

function validateGameId(gameName, res, id, optional) {
    const game = gameName.toLowerCase();
    const gameId = gameData.gameIds[game];

    if (!gameId) {
        res.status(404).json({ error: 'Game not found' });
        return false;
    }

    let url = `` ;
    if(id !== undefined){
        url = url + `/${id}`;
    }
    if(optional !== undefined){
        url = url + `/${optional}`;
    }
    url = url + `?filter=game.id=${gameId}`;

    return url;
}

module.exports = { gameData, validateGameId };
