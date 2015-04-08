"use strict"

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var passport = require('passport');
var http = require('http');
var https = require('https');
var logger = require('morgan');

/**
 * Initialise components and middleware
 * */

app.use(logger('dev')); // Logs calls to Express routes to terminal
app.use(bodyParser.json()); // Use body-parser to extract data from POST
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * Initialise Routes
 * */
var routeRoot = '/api/v1';
var indexRoutes = require('./routes/index');
var userRoutes = require('./routes/user');

app.use(routeRoot, indexRoutes);
app.use(routeRoot, userRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/**
 *  Load models
 * */
var models = require(__dirname + '/models');

/**
 * Load server configuration
 */

var serverConfig = require(__dirname + '/config/serverConfig');
var options = serverConfig.options;
var ports = serverConfig.ports;

/**
 * Synchronise models and launch server
 * */

models.sequelize.sync().then(function () {
    var httpsServer = https.createServer(options, app).listen(ports.SSLPort); // Start the server
});
