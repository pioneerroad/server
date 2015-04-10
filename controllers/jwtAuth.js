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
                res.end('Access token has expired', 400);
            }

            models.User.find(decoded.iss).then(function(err, user) { // Try to fetch a user from the database using the User ID (_id) encoded in the token
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(false);
                }
                req.user = user;
                return done();
            });

        } catch (err) {
            return done();
        }
    } else {
        done();
    }
};

// Helper function to call from middleware to check if user is Authenticated
module.exports.isAuthenticated = function(req, res) {
    if (!req.user) res.status(401).send({
        message: 'Not Authorised'
    });
    return true;
};