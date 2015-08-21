var jwtToken = require(__dirname + '/../controllers/jwtGenerate');
var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var matchUser = require(__dirname+'/../controllers/matchUser');
var express = require('express');
var router  = express.Router();
var passport = require('passport');

module.exports = function(app, passport) {
    var User = app.get('models').user_account;
    var Privacy = app.get('models').user_privacy;
    var Profile = app.get('models').user_profile;
    router.post('/user/create', function(req, res) {
        User.create({
            username: req.body.username,
            password: req.body.password,
            mobile: req.body.mobile
        }).then(function(user) {
            var response = {result:'CREATED_NEW_USER', data: user};
            res.status(200).json(response);
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
                var response = {result:'LOGIN_SUCCESSFUL', data: token};
                res.status(200).send(response);
            }
        }
    );

    /**
     * Get a single user with UID
     * Note: should only be used for loading a user's own account; different methods required to load other user profiles.
     * @todo compare requested uid with uid encoded in JWT for match */

    router.get(
      '/user/:uid/account/fetch', [jwtAuth, matchUser],
        function(req, res) {
            User.findById(req.params.uid).then(function (user) {
                if (user) {
                    var response = {result:'FETCHED_USER_ACCOUNT', data: user};
                    res.status(200).json(response);
                } else {
                    res.json({message: "USER_NOT_FOUND"});
                }
            });
        }
    );

    /**
     * @todo Need to verify email address and password after update */
    router.put(
        '/user/:uid/account/update', [jwtAuth, matchUser],
        function (req, res) {
            User.update(req.body,
                {where: {id: req.params.uid}, individualHooks: true, returning: true, limit: 1}).then(function (user) {
                    var response = {result: 'UPDATE_USER_ACCOUNT_DATA', data: user};
                    res.status(200).json(response);
                }).catch(function (err) {
                    res.status(400).json(err);
                });
        });

    return router;
};
