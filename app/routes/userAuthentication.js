// @file userAuthentication.js
// Routes for handling signup and user authentication

var jwtAuth = require('../controllers/jwtAuth');
var jwtToken = require('../controllers/jwtGenerate');
var bodyParser = require('body-parser');

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
    
    app.post('/user/create', function(req, res) {
        res.json({message:'Congratulations, you just signed up!'});
    });
    
    app.post(
        '/test',
        [urlEncodedParser, jwtAuth],
        function(req, res) {
            if (jwtAuth.isAuthenticated(req, res)) res.json({message:"something cool"});
        }
    );
}