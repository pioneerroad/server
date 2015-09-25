"use strict"
var express = require('express');
var router  = express.Router();
var app = express();
var http = require('http');
var https = require('https');
var server = http.Server(app);
var io = require('socket.io')(server); app.io = io; // Add io to app, to make it available to express routes.
var cors = require('cors');
var bodyParser = require('body-parser');
var passport = require('passport');
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
app.use(cors({origin: ['http://localhost:3000','http://app.pioneerroad.com.au','http://10.68.11.154:3000']}));
app.use(passport.initialize());
require (__dirname + '/controllers/passport') (app, passport);
app.use(logger('dev')); // Logs calls by Express routes to terminal
app.use(bodyParser.json()); // Use body-parser to extract data from POST
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
/** Multer defaults: upload files to /temp/uploads, max size = 10Mb per file, files are renamed to current datestamp **/
app.use(multer({dest: './temp/uploads/', limits: {fileSize:10*1024*1024}, rename: function(fieldname, filename) {return Date.now();}}));

/**
 * Socket.io configuration
 * */
var userSockets = require(__dirname+'/controllers/socket.io-controller')(app);

io.on('welcome',function(data) {
    console.log(data);
});

/**
 * Initialise Routes
 * */
var routeRoot = '/api/v1';
var indexRoutes = require('./routes/index'); app.use(routeRoot, indexRoutes);
var userRoutes = require('./routes/user_account') (app, passport, router); app.use(routeRoot, userRoutes);
var profileRoutes = require('./routes/user_profile') (app, userSockets, s3, router); app.use(routeRoot, profileRoutes);
var friendRoutes = require('./routes/friends') (app, userSockets, router); app.use(routeRoot, friendRoutes);
var privacyRoutes = require('./routes/user_privacy') (app, router); app.use(routeRoot, privacyRoutes);
//var vehicleRoutes = require('./routes/vehicle') (app); app.use(routeRoot, vehicleRoutes);

/** Management and utility routes*/
var utilityRoutes = require('./routes/utilities') (app, router); app.use(routeRoot, utilityRoutes);
var userManagementRoutes = require('./routes/user_account_management') (app, router); app.use(routeRoot, userManagementRoutes);


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

/*models.sequelize.sync().then(function () {*/
    //var modelSync = require(__dirname + '/migrations/sync_models') (models); // Apply non-sequelizeable elements to tables

    server.listen(ports.noSSLPort, function() {
        console.log('Listening on http://localhost:'+ports.noSSLPort);
    });
/*});*/
