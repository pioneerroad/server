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
            res.json({"USER_CREATE":true});
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
     * TEST ONLY*/
    router.get('/user', function(req, res) {
        res.json({message:"a user route"});
    });

    return router;
}