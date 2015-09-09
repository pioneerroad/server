// @file jwtauth.js

var url = require('url');
var User = require(__dirname+'/../models').user_account;

var jwt = require('jsonwebtoken');
var jwtSecret = require(__dirname+'/../config/jwtSecret').secret;

module.exports = function(req, res, done) {

    var parsedURL = url.parse(req.url, true);
    var token = (req.body && req.body.access_token) || parsedURL.query.access_token || req.headers["x-access-token"];
    if (token) {
        try {
            var decoded = jwt.verify(token, jwtSecret); // Decode the token
            User.findById(decoded.id).then(function(user) {
                req.decodedUser = user;
                return done();
            }).error(function(err) {
                res.status(403).json({message:'INVALID_USER_ACCOUNT'});
            });
        } catch (err) {
            res.status(403).json({error:err.message});
        }
    } else {
        res.status(403).json({message:'MISSING_TOKEN_FROM_REQUEST'})
    }
};
