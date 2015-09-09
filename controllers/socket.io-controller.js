var jwt = require('jsonwebtoken');
var jwtSecret = require(__dirname+'/../config/jwtSecret').secret;
var User = require(__dirname+'/../models').user_account;
var userSockets = {};

module.exports = function(app) {
    var io = app.io;

    require('socketio-auth')(io, {
        authenticate: function (socket, data, done) {
            var token = data.token;
            if (token) {
                try {
                    var decoded = jwt.verify(token, jwtSecret); // Decode the token
                    User.findById(decoded.id).then(function(user) {
                        return done(null, user);
                    }).error(function(err) {
                        res.status(403).json({message:'INVALID_USER_ACCOUNT'});
                        return done(new Error('INVALID_USER_ACCOUNT'));
                    });
                } catch (err) {
                    return done(new Error('TOKEN_VALIDATION_ERROR'));
                }
            } else {
                return done(new Error('MISSING_TOKEN_FROM_REQUEST'));
            }
        },
        postAuthenticate: function(socket, data) {
            var token = data.token;
            if (token) {
                try {
                    var decoded = jwt.verify(token, jwtSecret); // Decode the token
                    User.findById(decoded.id, {raw:true}).then(function(user) {
                        userSockets[user.id] = {sessionId: socket.conn.id};
                    }).error(function(err) {
                        throw new Error('AN_ERROR');
                    });
                } catch (err) {
                    throw new Error('AN_ERROR');
                }
            } else {
                throw new Error('AN_ERROR');
            }
        },
        timeout: 1000
    });

    return userSockets;
}
