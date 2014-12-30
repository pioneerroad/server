// @file jwtauth.js

var url = require('url');
var User = require('../models/user');
var express = require('express');
var app = express();
var jwt = require('jwt-simple');
var jwtSecret = require('../../instanceConfig/jwtSecret').secret;
app.set('jwtTokenSecret', jwtSecret);

module.exports = function(req, res, next) {
    var parsedURL = url.parse(req.url, true);
    var token = (req.body && req.body.access_token) || parsedURL.query.access_token || req.headers["x-access-token"];

    if (token) {
        
        try {
            var decoded = jwt.decode(token, app.get('jwtTokenSecret')); // Decode the token
            
            if (decoded.exp <= Date.now()) {  // Make sure it hasn't expired
                res.end('Access token has expired', 400);
            }
               
            User.findOne({'_id':decoded.iss}, function(err, user) { // Try to fetch a user from the database using the User ID (_id) encoded in the token
                if (err) { return next(err); }
                if (!user) { return next(false); }
                req.user = user;
                return next();
            });
            
        } catch (err) {
            return next();
        }
    } else {
        next();
    }
}

// Helper function to call from middleware to check if user is Authenticated
module.exports.isAuthenticated = function (req, res) {
    if (!req.user) res.status(401).send({message:'Not Authorised'});
    return true;
}