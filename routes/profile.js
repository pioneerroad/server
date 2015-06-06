var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var express = require('express');
var router  = express.Router();
var AWS = require('aws-sdk');
var fs = require('fs');

var accessKeyId =  process.env.AWS_ACCESS_KEY || "AKIAINM5LTI5MAGU5IVA";
var secretAccessKey = process.env.AWS_SECRET_KEY || "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";

AWS.config.update({
    accessKeyId: 'AKIAJAXNN62SJ3RTTMFA',
    secretAccessKey: '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',
    region: 'ap-southeast-2'
});

var s3 = new AWS.S3();

module.exports = function(app) {
    var Profile = app.get('models').user_profile;

    /**
     * Get a single user with UID
     * Note: should only be used for loading a user's own account; different methods required to load other user profiles.
     */

    router.get(
        '/user/:uid/profile/fetch', [jwtAuth],
        function(req, res) {
            if (user = jwtAuth.isAuthenticated(req, res)) {
                if (user.id == req.params.uid) { /* Check if requesting user (decoded from JWT) is same as requested */
                    Profile.find({where: {userId: req.params.uid}}).then(function (profile) {
                        if (profile) {
                                res.status(200).json(profile);
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

    router.post(
      '/upload', function(req, res) {
            if(req.files.image !== undefined){
                res.json(req.files); // success
                var params = {
                    Bucket: 'images.pioneerroad.com.au',
                    Key: 'profile-photos/jess/'+req.files.image.name,
                    Body: fs.createReadStream(req.files.image.path),
                    ContentType: req.files.image.mimetype,
                    ACL: 'public-read'
                };

                s3.upload(params, function(err, data) {
                    console.log(err, data);
                });
            }else{
                res.send("ERR_NO_FILE_CHOSEN");
            }
        }
    );

    return router;
};