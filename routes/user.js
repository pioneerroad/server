var models = require(__dirname + '/../models');
var jwtToken = require(__dirname + '/../controllers/jwtGenerate');
var express = require('express');
var router  = express.Router();
var passport = require('passport');

module.exports = function(app, passport) {
    router.post('/user/create', function(req, res) {
        models.User.create({
            username: req.body.username,
            password: req.body.password
        }).then(function() {
            res.json({message:"Created a user"});
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
                var token = jwtToken(app, req.user);
                res.status(200).send(token);
            }
        }
    );
    /**
     * TEST ONLY*/
    router.get('/user', function(req, res) {
        res.json({message:"a user route"});
    });

    return router;
}