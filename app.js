const express = require("express")
const app = express()
const bodyParser = require('body-parser');

// const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require('./utils/config');
const logger = require('./utils/logger');
const paymentController = require('./controllers/controllerOne.js');

const middleware = require('./utils/midddleware')

const cors = require('cors')


// Middleware
app.use(cors())
// app.use(morgan('combined', { stream: logger.stream }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(middleware.requestLogger)

// Database Connection config.mongodbEirlyUrl
mongoose.connect(config.mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('connected', () => {
  logger.info('Connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});


// Routes
app.use(express.static("build"))
app.use('/api', paymentController);



app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app