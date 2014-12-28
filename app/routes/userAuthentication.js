// @file userAuthentication.js
// Routes for handling signup and user authentication

var jwtAuth = require('../controllers/jwtauth');
var bodyParser = require('body-parser');

var jsonParser = bodyParser.json();
var urlEncodedParser = bodyParser.urlencoded({extended: false});

module.exports = function(app, passport) {
    // Process user login request
    app.get(
        '/user/authenticate',
        passport.authenticate('basic-login', { session: false }),
        function(req, res) {
            if (req.user) {
                var token = generateJwtToken(app, req.user);
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
            console.log(req.user);
            res.json({message:"something cool"});
        }
    );
}

/* Generate a JWT token, which will be sent to a user if login authenticated */
var generateJwtToken = function(app, user) {
    var jwt = require('jwt-simple');
    var moment = require('moment');
    var expires = moment().add(7, 'days').valueOf();
    var jwtSecret = require('../../instanceConfig/jwtSecret').secret;
    app.set('jwtTokenSecret', jwtSecret);
    
    var token = jwt.encode({
        iss: user.id,
        exp: expires
    }, app.get('jwtTokenSecret'));
 
    var response = {
        token : token,
        expires: expires,
        user: {
            id : user.id,
            username : user.username
        }
    };
    return response;    
}