const express = require('express');
const app = express();
const matchController = require('./controllers/matchController');
const playerController = require('./controllers/playerController');
const calendarController = require('./controllers/calendarController');


app.use('/api', matchController);
app.use('/api', playerController);
app.use('/api', calendarController);


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
