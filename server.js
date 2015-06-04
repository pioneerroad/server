"use strict"
var express = require('express');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
var passport = require('passport');
var http = require('http');
var https = require('https');
var logger = require('morgan');
var multer = require('multer');

/**
 *  Load models
 * */
var models = require(__dirname+'/models');
app.set('models', models);

/**
 * Initialise components and middleware
 * */
app.use(cors());
app.use(passport.initialize());
require (__dirname + '/controllers/passport') (app, passport);
app.use(logger('dev')); // Logs calls by Express routes to terminal
app.use(bodyParser.json()); // Use body-parser to extract data from POST
app.use(bodyParser.urlencoded({ extended: false }));
/** Multer defaults: upload files to /temp/uploads, max size = 10Mb per file, files are renamed to current datestamp **/
app.use(multer({dest: './temp/uploads/', limits: {fileSize:10*1024*1024}, rename: function(fieldname, filename) {return Date.now();}}));

/**
 * Initialise Routes
 * */
var routeRoot = '/api/v1';
var indexRoutes = require('./routes/index');
var userRoutes = require('./routes/user') (app, passport);
var profileRoutes = require('./routes/profile') (app);
var vehicleRoutes = require('./routes/vehicle') (app);

app.use(routeRoot, indexRoutes);
app.use(routeRoot, userRoutes);
app.use(routeRoot, profileRoutes);
app.use(routeRoot, vehicleRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

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
    // Yucky, yucky things we have to put here... yearhk..
    //models.sequelize.query('ALTER TABLE "areas" ADD COLUMN geog GEOGRAPHY(point, 4326)');
    //models.sequelize.query('ALTER TABLE "places" ADD COLUMN the_geog GEOGRAPHY(point, 4326)');
    //models.sequelize.query('ALTER TABLE "states" ADD COLUMN geog GEOGRAPHY(multipolygon, 4326)');

    var server = app.listen(ports.noSSLPort, function() {
      var host = server.address().address;
      var port = server.address().port;
      console.log('Listening at http: ' + port);
    }); // Start the server
});