// controllers/passport.js
// Configure passport strategies for local and Facebook signup/login
var BasicStrategy = require('passport-http').BasicStrategy;
var FacebookTokenStrategy = require('passport-facebook-token').Strategy;
//var authConfig = require('../../instanceConfig/authConfig');

module.exports = function(app, passport) {
    var User = app.get('models').user_account;
    // ============================================
    // Basic Strategy
    // ============================================

    /* Basic Login */
    passport.use('basic-login', new BasicStrategy({},
        function(username, password, done) {
            User.find({
                where: {username: username} }).then(function(user) {
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
