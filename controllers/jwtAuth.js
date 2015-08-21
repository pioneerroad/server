// @file jwtauth.js

var url = require('url');
var models = require(__dirname+'/../models');
var express = require('express');
var app = express();
var jwt = require('jwt-simple');
var jwtSecret = require(__dirname+'/../config/jwtSecret').secret;
app.set('jwtTokenSecret', jwtSecret);

module.exports = function(req, res, done) {

    var parsedURL = url.parse(req.url, true);
    var token = (req.body && req.body.access_token) || parsedURL.query.access_token || req.headers["x-access-token"];
    if (token) {
        try {
            var decoded = jwt.decode(token, app.get('jwtTokenSecret')); // Decode the token
            if (decoded.exp <= Date.now()) { // Make sure it hasn't expired
                res.status(400).json({message:'Access token has expired'});
            }

            models.user_account.findById(decoded.iss).then(function(user) { // Try to fetch a user from the database using the User ID (_id) encoded in the token
                if(!user) res.status(400).json({message:'USER_MISSING_OR_INVALID'});
                req.decodedUser = user;

                done();
            }).catch(function(err) {
                done(err);
            });

        } catch (err) {
            res.status(401).json({message:'INVALID_TOKEN'});
        }
    } else {
        res.status(400).json({message:'MISSING_TOKEN_FROM_REQUEST'})
    }
};
