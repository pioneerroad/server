var express = require('express');
var app = express();
var passport = require('passport');
var http = require('http');
var https = require('https');
var morgan = require('morgan');
var mongoose = require('mongoose');

// ============================================
// Initialise Components
// ============================================
app.use(morgan('dev')); // Logs calls to Express routes to terminal

// Connect to an instance of MongoDB
var configDB = require('./instanceConfig/dbConfig');
mongoose.connect(configDB.url); // connect to our database

/* Passport */
app.use(passport.initialize());
require('./app/controllers/passport') (app, passport);

// ============================================
// Setup Routes
// ============================================
/* Utility Routes */
require('./app/routes/userAuthentication') (app, passport, express);

/* API Routes */
require('./app/routes/userAccount') (app, express);
require('./app/routes/userProfile') (app, express);

// ============================================
// Server Config
// ============================================

var serverConfig = require('./instanceConfig/serverConfig');
var options = serverConfig.options;
var ports = serverConfig.ports;

var httpsServer = https.createServer(options, app).listen(ports.SSLPort); // Start the server