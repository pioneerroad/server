// @file jwtauth.js

var url = require('url');

// BEGIN REPLACE
// Replace this with call to MongoDB user model
// Faking database data
var users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
  , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
];

// Faking method to retrieve data from database
function findByUserId(userId, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.id === userId) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

// END REPLACE
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
            var decoded = jwt.decode(token, app.get('jwtTokenSecret'));
            if (decoded.exp <= Date.now()) {
                res.end('Access token has expired', 400);
            }
                
            findByUserId(decoded.iss, function(err, user) {
              if (err) { return done(err); }
              if (!user) { return done(null, false); }
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