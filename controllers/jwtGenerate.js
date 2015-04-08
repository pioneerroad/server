// @file jwtGenerate.js
// Generates a JWT Token
'use strict';

var jwt = require('jwt-simple');
var moment = require('moment');
var expires = moment().add(7, 'days').valueOf();
var jwtSecret = require(__dirname+'/../config/jwtSecret').secret;

module.exports = function(app, user) {
    app.set('jwtTokenSecret', jwtSecret);

    var token = jwt.encode({
        iss: user.id,
        exp: expires
    }, app.get('jwtTokenSecret'));

    var response = {
        token: token,
        expires: expires,
        user: {
            id: user.id,
            username: user.username
        }
    };
    return response;
};
