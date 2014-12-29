// @file createUser.js

var User = require('../models/user');

var userActions = {
    postUser : function(req, res) {
        var user = new User({
            basic: {
                username: req.body.username,
                password: req.body.password
            }
        });
        console.log(user);
        user.save(function(err) {
            if (err) console.log(err);
            console.log('Saved');
        });
    }
}

module.exports = userActions;