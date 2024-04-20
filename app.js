const express = require('express');
const app = express();
const matchController = require('./controllers/matchController');
const playerController = require('./controllers/playerController');
const calendarController = require('./controllers/calendarController');
const teamController = require('./controllers/teamController');
const eventController = require('./controllers/eventController');
const teamSummary = require('./controllers/teamSummary');


app.use('/api', matchController);
app.use('/api', playerController);
app.use('/api', calendarController);
app.use('/api', teamController);
app.use('/api', eventController);
app.use('/api', teamSummary);



app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
