var jwtToken = require(__dirname + '/../controllers/jwtGenerate');
var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var express = require('express');
var router  = express.Router();
var passport = require('passport');

module.exports = function(app, passport) {
    var Profile = app.get('models').user_profile;
    var Area = app.get('models').area;

    /**
     * Get a single user with UID
     * Note: should only be used for loading a user's own account; different methods required to load other user profiles.
     * @todo compare requested uid with uid encoded in JWT for match */

    router.get(
        '/user/:uid/profile/fetch', [jwtAuth],
        function(req, res) {
            if (user = jwtAuth.isAuthenticated(req, res)) {
                if (user.id == req.params.uid) { /* Check if requesting user (decoded from JWT) is same as requested */
                    Profile.find({where: {userId: req.params.uid}}).then(function (profile) {
                        if (profile) {
                            Area.find({where: {id: profile.homeTown}}).then(function (area) {
                                if (area) {
                                    profile.homeTown = area;
                                    res.json(profile);
                                } else {
                                    res.json({message: 'That town not found'});
                                }
                            });
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
        '/user/:uid/profile/update/', [jwtAuth],
        function (req, res) {
            if (user = jwtAuth.isAuthenticated(req, res)) {
                if (user.id == req.params.uid) { /* Check if requesting user (decoded from JWT) is same as requested profile */
                    Profile.update(req.body,
                        { where: {UserId:req.params.uid}, individualHooks: true, returning:true, limit:1}).then(function(numRows) {
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

    /** Add profile data */
    /** @todo ensure only one profile can be created per user ID */
    router.post(
      '/user/:uid/profile/create/', [jwtAuth],
        function (req, res) {
            if (user = jwtAuth.isAuthenticated(req, res)) {
                if (user.id == req.params.uid) { /* Check if requesting user (decoded from JWT) is same as requested profile */
                    console.log(req.body);
                    Profile.create({
                        fullName: req.body.fullname,
                        homeTown: req.body.hometown,
                        userId: user.id
                    }).then(function(profile) {
                        res.status(200).json(profile);
                    }).error(function(err) {
                        res.status(400).json(err);
                    });
                } else {
                    res.status(400).json({message:"User may only create their own profile"});
                }
            }
        }
    );

    /** Endpoint for hometown selection (autosuggest on client) */
    router.get(
     '/town/select/:input', function(req, res) {
            var test = app.get('models');
            var testing = test.sequelize.query("SELECT * FROM towns WHERE label ILIKE '%"+req.params.input+"%'", {type: test.sequelize.QueryTypes.SELECT}).then(function (towns, err) {
                if (towns) {
                    res.status(200).json(towns);
                } else {
                    res.status(400).json(err);
                }
            });
        }
    );

    /** Endpoint for privacy */
    router.put(
     '/user/:uid/profile/privacy', [jwtAuth],
        function (req, res) {
            if (user = jwtAuth.isAuthenticated(req, res)) {
                if (user.id == req.params.uid) { /* Check if requesting user (decoded from JWT) is same as requested profile */
                    console.log(req.body);
                    Profile.create({
                        fullName: req.body.fullname,
                        homeTown: req.body.hometown,
                        userId: user.id
                    }).then(function(profile) {
                        res.status(200).json(profile);
                    }).error(function(err) {
                        res.status(400).json(err);
                    });
                } else {
                    res.status(400).json({message:"User may only create their own profile"});
                }
            }
        }
    );

     /** Endpoint for photo upload **/
     router.put(
       '/user/:uid/profile/photo', [jwtAuth],
         function (req, res) {
             if (user = jwtAuth.isAuthenticated(req, res)) {
                 if (user.id == req.params.uid) { /* Check if requesting user (decoded from JWT) is same as requested profile */

                 } else {
                     res.status(400).json({message:"User may update their own profile photo"});
                 }
             }
         }
     );

    return router;
};