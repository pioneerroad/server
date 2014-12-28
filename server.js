var express = require('express');
var app = express();
var passport = require('passport');
var https = require('https');
var morgan = require('morgan');

// ============================================
// Initialise Components
// ============================================
app.use(morgan('dev')); // Logs calls to Express routes to terminal

/* Passport */
app.use(passport.initialize());
require('./app/controllers/passport') (app, passport);

// ============================================
// Setup Routes
// ============================================
/* Utility Routes */
require('./app/routes/userAuthentication') (app, passport);

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