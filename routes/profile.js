var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var express = require('express');
var router  = express.Router();
var fs = require('fs');

module.exports = function(app, s3) {
    var Profile = app.get('models').user_profile;
    var User = app.get('models').user;

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

     /** Endpoint for user profile photo upload **/
     /** @Todo refactor as promises if possible */
     /** @Todo Implement GN (GD/ImageMajik) Library */
     router.put(
       '/user/:uid/profile/photo', [jwtAuth],
         function (req, res) {
             if (user = jwtAuth.isAuthenticated(req, res)) {
                 if (user.id == req.params.uid) { /* Check if requesting user (decoded from JWT) is same as requested profile */
                     if(req.files.image !== undefined){
                         res.json(req.files); // success
                         User.find({
                             where: {id:req.params.uid}
                         }).success(function(user) {
                             var params = { //Set parameters for S3 storage
                                 Bucket: 'images.pioneerroad.com.au', // Bucket
                                 Key: 'profile-photos/'+user.username+'/'+req.files.image.name, // S3 storage location
                                 Body: fs.createReadStream(req.files.image.path), // Upload file (processed by Multer; read by fs)
                                 ContentType: req.files.image.mimetype, // Mimetype reported by Multer
                                 ACL: 'public-read' // Set S3 file permissions @todo perhaps this should be private and requests made by authorized S3 user?
                             };

                             s3.upload(params, function(err, data) {
                                 if (err) { console.log(err); }
                                 Profile.find({
                                   where: {userId:req.params.uid}
                                 }).success ( function (profile) {
                                    profile.updateAttributes({
                                        profilePhoto: data.Location
                                    }).success(function () {
                                        res.json({message:'Done'});
                                    })
                                 })
                             })
                             })
                     } else {
                         res.status(400).json({message:"ERR_NO_FILE_CHOSEN"});
                     }
                 } else {
                     res.status(400).json({message:"Profile photo can only be updated by its owner"});
                 }
             }
         }
     );

    router.post(
      '/upload', function(req, res) {
            if(req.files.profilePhoto !== undefined){
                res.json(req.files); // success
                var params = {
                    Bucket: 'images.pioneerroad.com.au',
                    Key: 'profile-photos/jess/'+req.files.image.name,
                    Body: fs.createReadStream(req.files.image.path),
                    ContentType: req.files.image.mimetype,
                    ACL: 'public-read'
                };

                s3.upload(params, function(err, data) {
                    if (err) { console.log(err); }
                    console.log(req.body);
                    Profile.update(req.body,
                        { where: {UserId:req.params.uid}, individualHooks: true, returning:true, limit:1}).then(function(numRows) {
                            res.status(200).json(numRows);
                        }).catch(function(err) {
                            res.status(400).json(err);
                        });
                    console.log(data.Location);
                });
            }else{
                res.status(400).json({message:"ERR_NO_FILE_CHOSEN"});
            }
        }
    );

    return router;
};