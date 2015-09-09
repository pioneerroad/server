// @file jwtGenerate.js
// Generates a JWT Token
'use strict';

var jwt = require('jsonwebtoken');
var jwtSecret = require(__dirname+'/../config/jwtSecret').secret;

module.exports = function(user) {

    var token = {token: jwt.sign(user, jwtSecret, {expiresInMinutes: 60*24*7})};
    token.user = {id: user.dataValues.id, username: user.dataValues.username}; // Append user data to token object

    return token;

};
