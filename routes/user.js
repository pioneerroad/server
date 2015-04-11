var models = require(__dirname + '/../models');
var jwtToken = require(__dirname + '/../controllers/jwtGenerate');
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
        }).then(function() {
            res.status(200).json({message:"User Created"});
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
     * @todo Need to verify email address and password after update */
    router.put(
        '/user/update/:uid',
        function (req, res) {
            models.User.update(req.body,
                { where: {id:req.params.uid}}).then(function(user) {
                    res.json('success');
                }).catch(function(user) {
                    res.json('error');
                });
        }
    );
    /**
     * TEST ONLY*/
    router.get('/user', function(req, res) {
        res.json({message:"a user route"});
    });

    return router;
};