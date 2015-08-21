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
var AWS = require('aws-sdk'); AWS.config.update({region: 'ap-southeast-2'}); var s3 = new AWS.S3(); // Load AWS SDK and set default region

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
var indexRoutes = require('./routes/index'); app.use(routeRoot, indexRoutes);
var userRoutes = require('./routes/user_account') (app, passport); app.use(routeRoot, userRoutes);
var profileRoutes = require('./routes/user_profile') (app, s3); app.use(routeRoot, profileRoutes);
var friendRoutes = require('./routes/friends') (app); app.use(routeRoot, friendRoutes);
var privacyRoutes = require('./routes/user_privacy') (app); app.use(routeRoot, privacyRoutes);
// var vehicleRoutes = require('./routes/vehicle') (app); app.use(routeRoot, vehicleRoutes);

/** Management and utility routes*/
var utilityRoutes = require('./routes/utilities') (app); app.use(routeRoot, utilityRoutes);
var userManagementRoutes = require('./routes/user_account_management') (app); app.use(routeRoot, userManagementRoutes);


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
    //var modelSync = require(__dirname + '/migrations/sync_models') (models); // Apply non-sequelizeable elements to tables

    var server = app.listen(ports.noSSLPort, function() {
      var host = server.address().address;
      var port = server.address().port;
      console.log('Listening at http: ' + port);
    }); // Start the server
});
