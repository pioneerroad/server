// @file jwtGenerate.js
// Generates a JWT Token
'use strict';

var jwt = require('jsonwebtoken');
var jwtSecret = require(__dirname+'/../config/jwtSecret').secret;

module.exports = function(user) {

    var token = jwt.sign(user, jwtSecret, {expiresInMinutes: 60*24*7});

    return token;

};
