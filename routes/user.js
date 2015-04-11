var models = require(__dirname + '/../models');
var jwtToken = require(__dirname + '/../controllers/jwtGenerate');
var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var express = require('express');
var router  = express.Router();
var passport = require('passport');

module.exports = function(passport) {
    router.post('/user/create', function(req, res) {
        models.User.create({
            username: req.body.username,
            password: req.body.password,
            mail: req.body.mail,
            cell: req.body.cell
        }).then(function(user) {
            res.status(200).json(user);
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
      '/user/fetch/:uid', [jwtAuth],
        function(req, res) {
            if (jwtAuth.isAuthenticated(req, res)) {
                models.User.find(req.params.uid).then(function(user) {
                    if (user) {
                        res.status(200).json(user);
                    } else {
                        res.json({message:"User not found"});
                    }
                });
            }
        }
    );

    /**
     * @todo Need to verify email address and password after update */
    router.put(
        '/user/update/:uid', [jwtAuth],
        function (req, res) {
            if (jwtAuth.isAuthenticated(req, res)) {
                models.User.update(req.body,
                    { where: {id:req.params.uid}, individualHooks: true, returning:true, limit:1}).then(function(numRows) {
                        res.status(200).json(numRows);
                    }).catch(function(err) {
                        res.status(400).json(err);
                    });
            }
        }
    );

    return router;
};