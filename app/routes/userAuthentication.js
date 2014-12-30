// @file userAuthentication.js
// Routes for handling signup and user authentication

var jwtAuth = require('../controllers/jwtAuth');
var jwtToken = require('../controllers/jwtGenerate');
var bodyParser = require('body-parser');
var userController = require('../controllers/userController')

var urlEncodedParser = bodyParser.urlencoded({extended: false});

module.exports = function(app, passport) {
    // Process user login request
    app.get(
        '/user/authenticate',
        passport.authenticate('basic-login', { session: false }),
        function(req, res) {
            if (req.user) {
                var token = jwtToken(app, req.user);
                res.json(token);  
            }
        }
    );
    
    app.post('/user/create', urlEncodedParser, function(req, res, next) {
        userController.postUser(req, res, function(err, user) {
            if (err) {
                res.status(400).send(err);
            } else {
                res.status(200).send(user);
            }
        });
    });
    
    app.post(
        '/test',
        [urlEncodedParser, jwtAuth],
        function(req, res) {
            if (jwtAuth.isAuthenticated(req, res)) res.json({message:"something cool"});
        }
    );
}