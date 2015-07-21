var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var express = require('express');
var router  = express.Router();
var Promise = require('bluebird');
var gm = require('gm').subClass({imageMagick:true});
Promise.promisifyAll(gm.prototype);
var fs = Promise.promisifyAll(require('fs'));

module.exports = function(app, s3) {
    var Profile = app.get('models').user_profile;
    var User = app.get('models').user_account;

    /**
     * Get a single user with UID
     * Note: should only be used for loading a user's own account; different methods required to load other user profiles.
     */

    router.get(
        '/user/:uid/profile/fetch', [jwtAuth],
        function (req, res) {
            if (user = jwtAuth.isAuthenticated(req, res)) {
                if (user.id == req.params.uid) { /* Check if requesting user (decoded from JWT) is same as requested */
                    Profile.find({where: {userAccountId: req.params.uid}}).then(function (data) {
                        if (data) {
                            res.status(200).json(data);
                        } else {
                            res.json({message: "User not found"});
                        }
                    });
                } else {
                    res.status(400).json({message: "User may only fetch their own profile"});
                }
            }
        }
    );

    /**
     * Update nickName field */
    router.put(
        '/user/:uid/profile/update/nickname', [jwtAuth],
        function (req, res) {
            if (user = jwtAuth.isAuthenticated(req, res)) {
                if (user.id == req.params.uid) { /* Check if requesting user (decoded from JWT) is same as requested profile */
                    if (!req.body.nickName) {
                        res.status(400).json({message: "MISSING_DATA_NICKNAME"})
                    } else {
                        var nickName = {nickName: req.body.nickName};
                        Profile.update(nickName,
                            {
                                fields: [user.nickName],
                                where: {userAccountId: req.params.uid},
                                individualHooks: true,
                                returning: true,
                                limit: 1
                            }).then(function (numRows) {
                                res.status(200).json(numRows);
                            }).catch(function (err) {
                                res.status(400).json(err);
                            });
                    }
                } else {
                    res.status(400).json({message: "User may only update their own profile"});
                }
            }
        }
    );

    /**
     * Update homeTown field */
    router.put(
        '/user/:uid/profile/update/hometown', [jwtAuth],
        function (req, res) {
            if (user = jwtAuth.isAuthenticated(req, res)) {
                if (user.id == req.params.uid) { /* Check if requesting user (decoded from JWT) is same as requested profile */
                    if (!req.body.homeTown) {
                        res.status(400).json({message: "MISSING_DATA_HOMETOWN"})
                    } else {
                        var homeTown = {homeTown: req.body.homeTown};
                        Profile.update(homeTown,
                            {
                                fields: [user.homeTown],
                                where: {userAccountId: req.params.uid},
                                individualHooks: true,
                                returning: true,
                                limit: 1
                            }).then(function (numRows) {
                                res.status(200).json(numRows);
                            }).catch(function (err) {
                                res.status(400).json(err);
                            });
                    }
                } else {
                    res.status(400).json({message: "User may only update their own profile"});
                }
            }
        }
    );

    /**
     * Update homeTown field */
    router.put(
        '/user/:uid/profile/update/current-location', [jwtAuth],
        function (req, res) {
            var dataStoreLocation = app.get('models').dataStore_location;

            if (user = jwtAuth.isAuthenticated(req, res)) {
                if (user.id == req.params.uid) { /* Check if requesting user (decoded from JWT) is same as requested profile */
                    if (!req.body.lat || !req.body.lon) {
                        res.status(400).json({message: "MISSING_OR_MALFORMED_DATA_LOCATION"})
                    } else {
                        var location = {checkinCoords: {lat: req.body.lat, lon: req.body.lon, updatedAt: Date.now()}};
                        Profile.update(location,
                            {
                                where: {userAccountId: req.params.uid},
                                individualHooks: true,
                                returning: true,
                                limit: 1
                            }).then(function (data) {
                                res.status(200).json(data);
                            }).catch(function (err) {
                                res.status(400).json(err);
                            });
                    }
                } else {
                    res.status(400).json({message: "User may only update their own profile"});
                }
            }
        }
    );

    /** Endpoint for user profile photo upload **/
    router.put('/user/:uid/profile/update/photo', [jwtAuth],
        function (req, res) {
            if (user = jwtAuth.isAuthenticated(req, res)) {
                if (user.id == req.params.uid) { /* Check if requesting user (decoded from JWT) is same as requested profile */
                    var uid = req.params.uid;
                    var image = req.files.image; image.fileNameBase = image.name.slice(0, image.name.indexOf('.')); //Store the filename without extension
                    var cropDimensions = {"width":req.body.width, "height":req.body.height, "x":req.body.x, "y":req.body.y}; // Read cropping dimensions from post data
                    var processedImageSizes = {
                        "xl": {
                            "width": 500,
                            "height": 500
                        },
                        "large": {
                            "width": 100,
                            "height": 100
                        },
                        "medium": {
                            "width": 50,
                            "height": 50
                        },
                        "small": {
                            "width": 30,
                            "height": 30
                        }
                    };
                    var fileStream = fs.createReadStream(image.path);

                    var params = require('../config/awsS3config.js').userContent.images;
                    params.ContentType = image.mimetype;
                    var imageUploadS3 = require('../controllers/imageUploadS3');

                    imageUploadS3.getImageSize(image.path)
                        .then(function (imageSize) {
                            processedImageSizes.original = {"width":imageSize.width, "height":imageSize.height}; // Add size of uploaded images to defaultImageSize array
                            return imageUploadS3.getUser(uid, User)
                                .then(function (userData) {
                                    var profilePhotoData = {}; // Initialise profilePhoto object
                                    /* Iterate through the array of sizes and process the image using the parameters for each on */
                                    for (var key in processedImageSizes) {
                                        if (processedImageSizes.hasOwnProperty(key)) {
                                            (function(imageSize) {
                                                if (imageSize == 'original') { // If this is the original image size, then just upload it
                                                    params.Key = 'profile-photos/'+userData.username+'/'+image.name;
                                                    params.Body = fs.createReadStream(image.path);
                                                    return imageUploadS3.s3Upload(params)
                                                        .then(function(uploadData) {
                                                            // Success
                                                        })
                                                        .catch(function(error) {
                                                            res.status(400).json('Error: '+error);
                                                        });
                                                } else {
                                                    gm(fileStream, image.name)
                                                        .crop(cropDimensions.width, cropDimensions.height, cropDimensions.x, cropDimensions.y)
                                                        .resize(processedImageSizes[imageSize].width)
                                                        .writeAsync('temp/uploads/'+image.fileNameBase+'_'+processedImageSizes[imageSize].width+'x'+processedImageSizes[imageSize].height+'.jpg')
                                                        .then(function(imageData) {
                                                            params.Key = 'profile-photos/'+userData.username+'/'+image.fileNameBase+'_'+processedImageSizes[imageSize].width+'x'+processedImageSizes[imageSize].height+'.jpg';
                                                            params.Body = fs.createReadStream('temp/uploads/'+image.fileNameBase+'_'+processedImageSizes[imageSize].width+'x'+processedImageSizes[imageSize].height+'.jpg');
                                                            return imageUploadS3.s3Upload(params)
                                                                .then(function(uploadData) {
                                                                    // Success
                                                                })
                                                                .catch(function(error) {
                                                                    res.status(400).json('Error: '+error);
                                                                })
                                                        })
                                                        .catch(function(error) {
                                                            res.status(400).json('Error: '+error);
                                                        });
                                                }
                                                profilePhotoData[imageSize] = image.fileNameBase+'_'+processedImageSizes[imageSize].width+'x'+processedImageSizes[imageSize].height+'.'+image.extension;
                                            }) (key)
                                        }
                                    }
                                    Profile.find({
                                        where: {userAccountId:uid}
                                    }).success ( function (profile) {
                                        profile.updateAttributes({
                                            profilePhoto: profilePhotoData
                                        });
                                        res.status(200).json({message:"USER_PROFILE_UPDATE_COMPLETE","data":profile});
                                    });
                                })
                                .catch(function(error) {
                                    res.status(400).json('Error: '+error);
                                })
                        })
                        .catch(function(error) {
                            res.status(400).json('Error: '+error);
                        });
                } else {
                    res.status(400).json({message:"NOT_AUTHORISED_INVALID_USER"});
                }
            } else {
                res.status(400).json({message:"NOT_AUTHORISED_INVALID_CREDENTIALS"});
            }
    });

    /** Endpoint for user profile background photo upload **/
    router.put('/user/:uid/profile/update/background-photo', [jwtAuth],
        function (req, res) {
            if (user = jwtAuth.isAuthenticated(req, res)) {
                if (user.id == req.params.uid) { /* Check if requesting user (decoded from JWT) is same as requested profile */
                    var uid = req.params.uid;
                    var image = req.files.image; image.fileNameBase = image.name.slice(0, image.name.indexOf('.')); //Store the filename without extension
                    var cropDimensions = {"width":req.body.width, "height":req.body.height, "x":req.body.x, "y":req.body.y}; // Read cropping dimensions from post data
                    var processedImageSizes = {
                        "large": {
                            "width": 1280,
                            "height": 474
                        },
                        "medium": {
                            "width": 540,
                            "height": 200
                        },
                        "small": {
                            "width": 230,
                            "height": 85
                        }
                    };
                    var fileStream = fs.createReadStream(image.path);

                    var params = require('../config/awsS3config.js').userContent.images;
                    params.ContentType = image.mimetype;
                    var imageUploadS3 = require('../controllers/imageUploadS3');

                    imageUploadS3.getImageSize(image.path)
                        .then(function (imageSize) {
                            processedImageSizes.original = {"width":imageSize.width, "height":imageSize.height}; // Add size of uploaded images to defaultImageSize array
                            return imageUploadS3.getUser(uid, User)
                                .then(function (userData) {
                                    var profilePhotoData = {}; // Initialise profilePhoto object
                                    /* Iterate through the array of sizes and process the image using the parameters for each on */
                                    for (var key in processedImageSizes) {
                                        if (processedImageSizes.hasOwnProperty(key)) {
                                            (function(imageSize) {
                                                if (imageSize == 'original') { // If this is the original image size, then just upload it
                                                    params.Key = 'profile-photos/'+userData.username+'/background-photos/'+image.name;
                                                    params.Body = fs.createReadStream(image.path);
                                                    return imageUploadS3.s3Upload(params)
                                                        .then(function(uploadData) {
                                                            // Success
                                                        })
                                                        .catch(function(error) {
                                                            res.status(400).json('Error: '+error);
                                                        });
                                                } else {
                                                    gm(fileStream, image.name)
                                                        .crop(cropDimensions.width, cropDimensions.height, cropDimensions.x, cropDimensions.y)
                                                        .resize(processedImageSizes[imageSize].width)
                                                        .writeAsync('temp/uploads/'+image.fileNameBase+'_'+processedImageSizes[imageSize].width+'x'+processedImageSizes[imageSize].height+'.jpg')
                                                        .then(function(imageData) {
                                                            params.Key = 'profile-photos/'+userData.username+'/background-photos/'+image.fileNameBase+'_'+processedImageSizes[imageSize].width+'x'+processedImageSizes[imageSize].height+'.jpg';
                                                            params.Body = fs.createReadStream('temp/uploads/'+image.fileNameBase+'_'+processedImageSizes[imageSize].width+'x'+processedImageSizes[imageSize].height+'.jpg');
                                                            return imageUploadS3.s3Upload(params)
                                                                .then(function(uploadData) {
                                                                    // Success
                                                                })
                                                                .catch(function(error) {
                                                                    res.status(400).json('Error: '+error);
                                                                })
                                                        })
                                                        .catch(function(error) {
                                                            res.status(400).json('Error: '+error);
                                                        });
                                                }
                                                profilePhotoData[imageSize] = image.fileNameBase+'_'+processedImageSizes[imageSize].width+'x'+processedImageSizes[imageSize].height+'.'+image.extension;
                                            }) (key)
                                        }
                                    }
                                    Profile.find({
                                        where: {userAccountId:uid}
                                    }).success ( function (profile) {
                                        profile.updateAttributes({
                                            profileBackgroundPhoto: profilePhotoData
                                        });
                                        res.status(200).json({message:"USER_PROFILE_UPDATE_COMPLETE","data":profile});
                                    });
                                })
                                .catch(function(error) {
                                    res.status(400).json('Error: '+error);
                                })
                        })
                        .catch(function(error) {
                            res.status(400).json('Error: '+error);
                        });
                } else {
                    res.status(400).json({message:"NOT_AUTHORISED_INVALID_USER"});
                }
            } else {
                res.status(400).json({message:"NOT_AUTHORISED_INVALID_CREDENTIALS"});
            }
        });

        return router;
    };