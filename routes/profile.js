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

    /** Endpoint for privacy settings */
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

     router.put('/user/:uid/profile/photo', [jwtAuth],
         function (req, res) {
             if (user = jwtAuth.isAuthenticated(req, res)) {
                 if (user.id == req.params.uid) { /* Check if requesting user (decoded from JWT) is same as requested profile */
                     var cropDimensions = {"width":req.body.width, "height":req.body.height, "x":req.body.x, "y":req.body.y};
                     if(req.files.image !== undefined && cropDimensions.x !== undefined && cropDimensions.y !== undefined && cropDimensions.width !== undefined && cropDimensions.height !== undefined){ // Check if image and correct cropping parameters sent in HTTP request
                         var imageFile = req.files.image;
                         imageFile.fileNameBase = imageFile.name.slice(0, imageFile.name.indexOf('.')); //Store the filename without extension

                         /* Default params for s3 storage*/
                         var params = {
                             Bucket: 'images.pioneerroad.com.au',
                             ContentType: imageFile.mimetype,
                             ACL: 'public-read'
                         };

                         User.find({
                             where: {id: req.params.uid} // Find user from ID passed in HTTP req
                         }).then(
                             function (user) {
                                 gm(imageFile.path).size(function(err, data) { // Get size of uploaded image
                                     //if (err) { res.status(400).json(err) };
                                     var imageSizes = {"original":[data.width,data.height],"large":[100,100],"medium":[50,50],"small":[30,30]}; // Sizes of processed images
                                     var profileData = {};
                                     for (var key in imageSizes) {
                                         if (imageSizes.hasOwnProperty(key)) {
                                             if (key != 'original') { // We won't process the original image, so just upload it
                                                 profileData[key] = imageFile.fileNameBase+'_'+imageSizes[key][0]+'x'+imageSizes[key][1]+'.'+imageFile.extension;
                                                 var readStream = fs.createReadStream(imageFile.path);
                                                 (function(imageVersion) { // Encapsulated function to allow async function to take current iteration of image size as a variable
                                                     var processedFilePath = 'temp/uploads/'+imageFile.fileNameBase+'_'+imageSizes[imageVersion][0]+'x'+imageSizes[imageVersion][0]+'.'+imageFile.extension; // Path where processed image will be stored before upload to S3
                                                     gm(readStream, imageFile.name) // Read the original file and process it  (crop & resize)
                                                         .crop(cropDimensions.width, cropDimensions.height, cropDimensions.x, cropDimensions.y)
                                                         .resize(imageSizes[imageVersion][0])
                                                         .write(processedFilePath, function(err, imageData) {
                                                             //if (err) { res.status(400).json(err);}
                                                             // Prepare unique values for upload to S3
                                                             params.Key = 'profile-photos/'+user.username+'/'+imageFile.fileNameBase+'_'+imageSizes[imageVersion][0]+'x'+imageSizes[imageVersion][0]+'.'+imageFile.extension;
                                                             params.Body = fs.createReadStream(processedFilePath);
                                                             s3.upload(params, function(err, data) {
                                                                 //if (err) { res.status(400).json(err) }
                                                                 // Success
                                                             });
                                                         });
                                                 })(key);

                                             } else {
                                                 profileData[key] = imageFile.fileNameBase+'.'+imageFile.extension;
                                                 params.Key = 'profile-photos/'+user.username+'/'+imageFile.name;
                                                 params.Body = fs.createReadStream(imageFile.path);
                                                 s3.upload(params, function(err, data) {
                                                     //if (err) { res.status(400).json(err) }
                                                 });
                                             }
                                             Profile.find({
                                                 where: {userId:req.params.uid}
                                             }).success ( function (profile) {
                                                 profile.updateAttributes({
                                                     profilePhoto: profileData
                                                 });
                                                 res.status(200).json({message:"USER_PROFILE_UPDATE_COMPLETE","data":profile});
                                             });

                                         }
                                     }
                                 });
                             },
                             function (error) {
                                 res.status(400).json({message:error})
                             });
                     } else {
                         res.status(400).json({message: "ERR_NO_FILE_CHOSEN"});
                     }
                 } else {
                     res.status(400).json({message: "ERR_UNAUTHORISED_FOR_CURRENT_USER"});
                 }
             }
         }
     );

    router.post(
      '/upload', function(req, res) {
            var imageFile = req.files.profilePhoto;
            var cropDimensions = {"width":req.body.width, "height":req.body.height, "x":req.body.x, "y":req.body.y};

            if(req.files.profilePhoto !== undefined && cropDimensions.x !== undefined && cropDimensions.y !== undefined && cropDimensions.width !== undefined && cropDimensions.height !== undefined){
                /* Default params for s3 storage*/
                var params = {
                    Bucket: 'images.pioneerroad.com.au',
                    ContentType: imageFile.mimetype,
                    ACL: 'public-read'
                };

                imageFile.fileNameBase = imageFile.name.slice(0, imageFile.name.indexOf('.')); //Store the filename without extension
                gm(imageFile.path).size(function(err, data) {
                    if (err) console.log(err);
                    var imageSizes = {"original":[data.width,data.height],"large":[100,100],"medium":[50,50],"small":[30,30]};
                    for (var key in imageSizes) {
                        if (imageSizes.hasOwnProperty(key)) {
                            if (key != 'original') {
                                var readStream = fs.createReadStream(imageFile.path);
                                (function(imageVersion) {
                                    var processedFilePath = 'temp/uploads/'+imageFile.fileNameBase+'_'+imageSizes[imageVersion][0]+'x'+imageSizes[imageVersion][0]+'.'+imageFile.extension;
                                    gm(readStream, imageFile.name)
                                        .crop(cropDimensions.width, cropDimensions.height, cropDimensions.x, cropDimensions.y)
                                        .resize(imageSizes[imageVersion][0])
                                        .write(processedFilePath, function(err, imageData) {
                                            if (err) console.log(err);
                                            params.Key = 'test-upload/'+imageFile.fileNameBase+'_'+imageSizes[imageVersion][0]+'x'+imageSizes[imageVersion][0]+'.'+imageFile.extension;
                                            params.Body = fs.createReadStream(processedFilePath);
                                            s3.upload(params, function(err, data) {
                                                if (err) { console.log(err); }
                                                console.log(data);
                                            })
                                        });
                                })(key);

                            } else {
                                params.Key = 'test-upload/'+imageFile.name;
                                params.Body = fs.createReadStream(imageFile.path);
                                s3.upload(params, function(err, data) {
                                    if (err) { console.log(err); }
                                    res.status(200).json(data);
                                });
                            }

                        }
                    }
                });
            } else { // Cropping parameters missing or invalid
                res.status(400).json({message:"INVALID_OR_MISSING_PARAMETERS"});
            }
        }
    );

    return router;
};