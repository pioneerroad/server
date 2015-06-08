var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var express = require('express');
var router  = express.Router();
var fs = require('fs');
var gm = require('gm').subClass({imageMagick:true});

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
     /** @Todo Implement GM (GD/ImageMajik) Library */
     router.put(
       '/user/:uid/profile/photo', [jwtAuth],
         function (req, res) {
             if (user = jwtAuth.isAuthenticated(req, res)) {
                 if (user.id == req.params.uid) { /* Check if requesting user (decoded from JWT) is same as requested profile */
                     if(req.files.image !== undefined){ // Check if image sent in HTTP request
                         var imageFile = req.files.image;
                         imageFile.fileNameBase = imageFile.name.slice(0,imageFile.name.indexOf('.')); //Store the filename without extension

                         var params = { //Set default parameters for S3 storage
                             Bucket: 'images.pioneerroad.com.au', // Bucket
                             ContentType: imageFile.mimetype, // Mimetype reported by Multer
                             ACL: 'public-read' // Set S3 file permissions
                         };
                         User.find({
                             where: {id:req.params.uid} // Find user from ID passed in HTTP req
                         }).success(function(user) { // If found....
                             var readStream = fs.createReadStream(imageFile.path); // Create file stream from path
                             /* Upload original image to S3 (no modifications) */
                             params.Key = 'profile-photos/'+user.username+'/'+imageFile.name;
                             params.Body = fs.createReadStream(imageFile.path);
                             s3.upload(params, function(err, data) {
                                 if (err) { console.log(err); }
                                 Profile.find({
                                     where: {userId:req.params.uid}
                                 }).success ( function (profile) {
                                     profile.updateAttributes({
                                         profilePhoto: {
                                             "baseFileName": imageFile.fileNameBase,
                                             "originalURL": data.Location
                                         }
                                     }).success(function () {
                                         res.json({message:'Done'});
                                     })
                                 });
                             });
                         });
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

                var imageFile = req.files.profilePhoto;

                /* Default params for s3 storage*/
                var params = {
                    Bucket: 'images.pioneerroad.com.au',
                    ContentType: imageFile.mimetype,
                    ACL: 'public-read'
                };
                imageFile.fileNameBase = imageFile.name.slice(0,imageFile.name.indexOf('.')); //Store the filename without extension
                var readStream = fs.createReadStream(imageFile.path);
                gm(readStream, imageFile.name)
                    .resize(200,200)
                    .crop(100,100,50,50)
                    .write('./temp/uploads/'+imageFile.fileNameBase+'_100x100.'+imageFile.extension, function (err) {
                        params.Key = fs.createReadStream('./temp/uploads/'+imageFile.fileNameBase+'_100x100.'+imageFile.extension);
                        s3.upload(params, function(err, data) {
                            if (err) { console.log(err); }
                            Profile.update(req.body,
                                { where: {UserId:req.params.uid}, individualHooks: true, returning:true, limit:1}).then(function(numRows) {
                                    res.status(200).json(numRows);
                                }).catch(function(err) {
                                    res.status(400).json(err);
                                });
                            console.log(data.Location);
                        });
                    });
                /*var params = {
                    Bucket: 'images.pioneerroad.com.au',
                    Key: 'profile-photos/jess/'+req.files.image.name,
                    Body: fs.createReadStream(req.files.image.path),
                    ContentType: req.files.image.mimetype,
                    ACL: 'public-read'
                }; */


            }else{
                res.status(400).json({message:"ERR_NO_FILE_CHOSEN"});
            }
        }
    );

    return router;
};