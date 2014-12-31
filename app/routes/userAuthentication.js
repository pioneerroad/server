// @file userAuthentication.js
// Routes for handling signup and user authentication

var jwtAuth = require('../controllers/jwtAuth');
var jwtToken = require('../controllers/jwtGenerate');
var bodyParser = require('body-parser');
var userController = require('../controllers/userController')

var urlEncodedParser = bodyParser.urlencoded({extended: false});

module.exports = function(app, passport) {
    // Process user login request
    
    // ============================================
    // Basic Routes
    // ============================================
    app.post(
        '/user/basic/authenticate',
        passport.authenticate('basic-login', { session: false }),
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
    
    app.post('/user/basic/create', urlEncodedParser, function(req, res, next) {
        userController.postUser(req, res, function(err, user) {
            if (err) {
                res.status(400).send(err);
            } else {
                res.status(200).send(user);
            }
        });
    });
    
    // ============================================
    // Facebook Routes
    // ============================================



    // ============================================
    // Test Routes (Delete later)
    // ============================================
    
    
    
    app.post(
        '/test',
        [urlEncodedParser, jwtAuth],
        function(req, res) {
            if (jwtAuth.isAuthenticated(req, res)) res.json({message:"something cool"});
        }
    );
}