// @file createUser.js

var User = require('../models/user');

var userActions = {
    postUser : function(req, res, fn) {
        var user = new User({
            basic: {
                username: req.body.username,
                password: req.body.password
            }
        });

        user.save(function(err) {
            if (err) { return fn(err, null) };
            return fn(null, user);
        });
    }
}

module.exports = userActions;