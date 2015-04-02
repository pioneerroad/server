// @file userAuthentication.js
// Routes for handling signup and user authentication

var jwtAuth = require('../controllers/jwtAuth');
var jwtToken = require('../controllers/jwtGenerate');
var bodyParser = require('body-parser');
var userController = require('../controllers/userController');

var urlEncodedParser = bodyParser.urlencoded({
    extended: false
});
var User = require('../models/user');

module.exports = function(app, passport, express) {
    var router = express.Router();

    app.use('/api/v1/user', router);
    // ============================================
    // Basic Routes
    // ============================================

    // Authenticate a user (basic strategy)
    router.post(
        '/login',
        passport.authenticate('basic-login', {
            session: false
        }),
        function(req, res) {
            if (req.user.error) {
                res.status(400).send(req.user.error);
                return false;
            }
            if (req.user) { // Username and password OK, give the user a token
                var token = jwtToken(app, req.user);
                res.status(200).send(token);
            }
        }
    );

    // ============================================
    // Facebook Routes
    // ============================================

};