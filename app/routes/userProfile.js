// app/routes/userProfile.js
// Routes for handling fetch (GET) and update (PUT/POST) of user profile data
// Note: 
// GET and PUT routes can be accessed by owner of profile.
// GET routes for full profile to be accessed by owner of profile and friends of owner (need authenticated and authorized user)
// GET routes for limited profile to be accessed by authenticated users

var jwtAuth = require('../controllers/jwtAuth');
var jwtToken = require('../controllers/jwtGenerate');
var bodyParser = require('body-parser');
var userController = require('../controllers/userController');

var urlEncodedParser = bodyParser.urlencoded({
	extended: false
});
var User = require('../models/user');

module.exports = function(app, express) {
	var router = express.Router();

	router.get('/endpoint', function(req, res) {
		res.json({
			message: 'Something sooooo coool just happened!'
		});
	});

	app.use('/api/v1/user/profile', router);
};