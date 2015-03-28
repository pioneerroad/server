// app/routes/userAccount.js
// Routes for handling fetch (GET) and update (PUT) of user account details (eg. username and password)
// Note: Only accessible by user who owns user profile, so need an authenticated user and user details (eg. username) extracted from token
var jwtAuth = require('../controllers/jwtAuth');
var jwtToken = require('../controllers/jwtGenerate');
var bodyParser = require('body-parser');
var userController = require('../controllers/userController');

var urlEncodedParser = bodyParser.urlencoded({
    extended: false
});
var User = require('../models/user');

module.exports = function(app, express) {
    var router = express.Router();

    app.use('/api/v1/user/account', router); // Register root URI for account-related routes

    // Create a new user Account
    router.post('/create', urlEncodedParser, function(req, res, next) {
        userController.postUser(req, res, function(err, user) {
            if (err) {
                res.status(400).send(err);
            } else {
                res.status(200).send(user);
            }
        });
    });

    // Delete user account of authenticated user
    router.post(
        '/delete', [urlEncodedParser, jwtAuth],
        function(req, res) {
            if (jwtAuth.isAuthenticated(req, res)) {
                User.findByIdAndRemove(req.user._id, function(err, user) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.json(user);
                    }
                });
            }
        });

    // Fetch authenticated user's user data, such as real name, gender and DOB
    router.get(
        '/fetch/userdata', [urlEncodedParser, jwtAuth],
        function(req, res) {
            if (jwtAuth.isAuthenticated(req, res)) {
                User.findById(req.user._id, 'userData', function(err, user) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.json(user);
                    }
                });
            }
        });

    // Update user data, such as real names, gender and DOB.
    router.post(
        '/update/userdata', [urlEncodedParser, jwtAuth],
        function(req, res) {
            if (jwtAuth.isAuthenticated(req, res)) {
                User.findById(req.user._id, function(err, user) {
                    if (err) {
                        res.send(err);
                    } else {
                        user.userData.firstName = req.body.firstname;
                        user.userData.surname = req.body.surname;
                        user.userData.gender = req.body.gender;
                        user.userData.dob = req.body.dob;
                    }

                    user.save(function(err) {
                        if (err) res.send(err);
                        res.json(user);
                    });
                });
            }
        });

    // Fetch authenticated user's username and password
    router.get(
        '/fetch/basic', [urlEncodedParser, jwtAuth],
        function(req, res) {
            if (jwtAuth.isAuthenticated(req, res)) {
                User.findById(req.user._id, 'basic', function(err, user) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.json(user);
                    }
                });
            }
        });

    // Update password of authenticated user
    router.post(
        '/update/password', [urlEncodedParser, jwtAuth],
        function(req, res) {
            if (jwtAuth.isAuthenticated(req, res)) {
                User.findById(req.user._id, function(err, user) {
                    if (err) {
                        res.send(err);
                    } else {
                        user.basic.password = req.body.password;
                    }

                    user.save(function(err) {
                        if (err) res.send(err);

                        res.json(user);
                    });
                });
            }
        });
};