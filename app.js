const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const { wss } = require('./liveWebsocketServer');

const matchController = require('./controllers/matchController');
const playerController = require('./controllers/playerController');
const calendarController = require('./controllers/calendarController');
const teamController = require('./controllers/teamController');
const eventController = require('./controllers/eventController');
const teamSummary = require('./controllers/teamSummary');
const postgameController = require('./controllers/postgameController');

app.use('/api', matchController);
app.use('/api', playerController);
app.use('/api', calendarController);
app.use('/api', teamController);
app.use('/api', eventController);
app.use('/api', teamSummary);
app.use('/api', postgameController);

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

server.listen(4000, () => {
    console.log('Server is running on port 3000');
});
