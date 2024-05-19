const WebSocket = require('ws');

const wss = new WebSocket.Server({ noServer: true });

const clients = new Set();

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    clients.add(ws);

    ws.on('close', () => {
        clients.delete(ws);
        console.log('WebSocket client disconnected');
    });

    ws.send('Welcome to the WebSocket server!');
});

module.exports = { wss, clients };
