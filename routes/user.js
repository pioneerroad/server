var jwtToken = require(__dirname + '/../controllers/jwtGenerate');
var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var express = require('express');
var router  = express.Router();
var passport = require('passport');

module.exports = function(app, passport) {
    var User = app.get('models').user;
    var Privacy = app.get('models').privacy;
    var Profile = app.get('models').user_profile;
    router.post('/user/create', function(req, res) {
        User.create({
            username: req.body.username,
            password: req.body.password,
            mail: req.body.mail,
            cell: req.body.cell
        }).then(function(user) {
            Privacy.create({ /* Create a default privacy profile too */
                userId: user.id
            }).then(function(privacy) {
                Profile.create({
                    userId: user.id
                }).then(function(profile) {
                    res.status(200).json(user);
                })
            });
        }).error(function(err) {
            res.status(400).json(err);
        });
    });

    router.post(
        '/user/login',
        passport.authenticate('basic-login', {
            session: false
        }),
        function(req, res) {
            if (req.user.error) {
                res.status(400).send(req.user.error);
                return false;
            }
            if (req.user) { // Username and password OK, give the user a token
                var token = jwtToken(req.app, req.user);
                res.status(200).send(token);
            }
        }
    );

    /**
     * Get a single user with UID
     * Note: should only be used for loading a user's own account; different methods required to load other user profiles.
     * @todo compare requested uid with uid encoded in JWT for match */

    router.get(
      '/user/account/fetch/:uid', [jwtAuth],
        function(req, res) {
            if (user = jwtAuth.isAuthenticated(req, res)) {
                if (user.id == req.params.uid) { /* Check if requesting user (decoded from JWT) is same as requested */
                    User.find(req.params.uid).then(function (user) {
                        if (user) {
                            res.status(200).json(user);
                        } else {
                            res.json({message: "User not found"});
                        }
                    });
                } else {
                    res.status(400).json({message:"User may only fetch their own profile"});
                }
            }
        }
    );

    /**
     * @todo Need to verify email address and password after update */
    router.put(
        '/user/account/update/:uid', [jwtAuth],
        function (req, res) {
            if (user = jwtAuth.isAuthenticated(req, res)) {
                if (user.id == req.params.uid) { /* Check if requesting user (decoded from JWT) is same as requested profile */
                    User.update(req.body,
                        { where: {id:req.params.uid}, individualHooks: true, returning:true, limit:1}).then(function(numRows) {
                            res.status(200).json(numRows);
                        }).catch(function(err) {
                            res.status(400).json(err);
                        });
                } else {
                    res.status(400).json({message:"User may only update their own profile"});
                }
            }
        }
    );

    return router;
};