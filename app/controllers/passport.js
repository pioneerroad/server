// app/passport.js
// Configure passport strategies for local and Facebook signup/login

var BasicStrategy = require('passport-http').BasicStrategy;
var FacebookTokenStrategy = require('passport-facebook-token').Strategy;
var User = require('../models/user');
var authConfig = require('../../instanceConfig/authConfig');

module.exports = function(app, passport) {

    // ============================================
    // Basic Strategy
    // ============================================

    /* Basic Login */
    passport.use('basic-login', new BasicStrategy({},
        function(username, password, done) {
            User.findOne({
                'basic.username': username
            }, function(err, user) {
                if (err) {
                    return done(err);
                } // If error
                if (!user) {
                    return done(null, {
                        error: 'USER_NOT_FOUND'
                    });
                } // If user not found

                // User found so check password
                user.verifyPassword(password, function(err, res) {
                    if (!res) {
                        return done(null, {
                            error: 'BAD_PASSWORD'
                        }); // Wrong password
                    } else {
                        return done(null, user); // Password correct so return user
                    }
                });
            });
        }
    ));

    // ============================================
    // Facebook Strategy
    // ============================================

};