var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var matchUser = require(__dirname+'/../controllers/matchUser');
var express = require('express');
var router  = express.Router();
var Promise = require('bluebird');
var gm = require('gm').subClass({imageMagick:true});
Promise.promisifyAll(gm.prototype);
var fs = Promise.promisifyAll(require('fs'));

module.exports = function(app, s3) {
    var Profile = app.get('models').user_profile;
    var User = app.get('models').user_account;
    var Towns = app.get('models').dataSet_towns;

    /**
     * Get a single user with UID
     * Note: should only be used for loading a user's own account; different methods required to load other user profiles.
     */

    router.get(
        '/user/:uid/profile/fetch', [jwtAuth, matchUser],
        function (req, res) {
            Profile.find({where: {userAccountId: req.params.uid},include:[Towns]}).then(function (data) {
                if (data) {
                    res.status(200).json(data);
                } else {
                    res.json({message: "User not found"});
                }
            });
        }
    );

    /**
     * Update nickName field */
    router.put(
        '/user/:uid/profile/update/nickname', [jwtAuth, matchUser],
        function (req, res) {
            if (!req.body.nickName) {
                res.status(400).json({message: "MISSING_DATA_NICKNAME"})
            } else {
                var nickName = {nickName: req.body.nickName};
                Profile.update(nickName,
                    {
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
        }
    );

    /**
     * Update homeTown field */
    router.put(
        '/user/:uid/profile/update/hometown', [jwtAuth, matchUser],
        function (req, res) {
            if (!req.body.homeTownId) {
                res.status(400).json({message: "MISSING_DATA_HOMETOWN"})
            } else {
                var homeTownId = {homeTownId: req.body.homeTownId};
                Profile.update(homeTownId,
                    {
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
        }
    );

    router.get(
        '/user/:uid/profile/hometown', [jwtAuth, matchUser],
        function (req, res) {
            Profile.find({where: {userAccountId: req.params.uid}}).then(function (data) {
                if (data) {
                    res.status(200).json(data);
                } else {
                    res.json({message: "User not found"});
                }
            });
        }
    )

    /**
     * Update current location */
    router.put(
        '/user/:uid/profile/update/current-location', [jwtAuth, matchUser],
        function (req, res) {
            var dataStoreLocation = app.get('models').dataStore_location;
                if (!req.body.lat || !req.body.lon) {
                    res.status(400).json({message: "MISSING_OR_MALFORMED_DATA_LOCATION"})
                } else {
                    var coordsObj = {
                        'lat': parseFloat(req.body.lat),
                        'lon' : parseFloat(req.body.lon)
                    };

                    var location = {checkinCoords: {lat: coordsObj.lat, lon: coordsObj.lon, updatedAt: Date.now()}};

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
        }
    );

    /** Endpoint for user profile photo upload **/
    router.put('/user/:uid/profile/update/photo', [jwtAuth, matchUser],
        function (req, res) {
            var uid = req.params.uid;
            var image = req.files.image; image.fileNameBase = image.name.slice(0, image.name.indexOf('.')); //Store the filename without extension
            var cropDimensions = {"width":req.body.width, "height":req.body.height, "x":req.body.x, "y":req.body.y}; // Read cropping dimensions from post data
            var processedImageSizes = {
                "xl": {
                    "width": 500,
                    "height": 500
                },
                "large": {
                    "width": 200,
                    "height": 200
                },
                "medium": {
                    "width": 100,
                    "height": 100
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
                            Profile.findOne({
                                where: {userAccountId:uid}
                            }).then (function (profile) {
                                console.log(profile);
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
    });

    /** Endpoint for user profile background photo upload **/
    router.put('/user/:uid/profile/update/background-photo', [jwtAuth, matchUser],
        function (req, res) {
            var uid = req.params.uid;
            var image = req.files.image; image.fileNameBase = image.name.slice(0, image.name.indexOf('.')); //Store the filename without extension
            var cropDimensions = {"width":req.body.width, "height":req.body.height, "x":req.body.x, "y":req.body.y}; // Read cropping dimensions from post data
            var processedImageSizes = {
                "large": {
                    "width": 1280,
                    "height": 430
                },
                "medium": {
                    "width": 414,
                    "height": 140
                },
                "small": {
                    "width": 320,
                    "height": 107
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
        });

        router.get('/user/:uid/current-location', [jwtAuth, matchUser],
            function(req, res) {
                var models = app.get('models');
                var currentLocation = models.sequelize.query('SELECT towns."location", towns."tourism_region", towns."state", ST_DISTANCE_SPHERE(towns.geom, (SELECT "user_profiles"."the_geom" FROM "user_profiles" WHERE "user_profiles"."userAccountId" = :uid)) / 1000 AS distance FROM "dataSet_towns" AS towns WHERE ST_DISTANCE_SPHERE(towns.geom, (SELECT "user_profiles"."the_geom" FROM "user_profiles" WHERE "user_profiles"."userAccountId" = :uid)) < 100000 ORDER BY ST_DISTANCE_SPHERE(towns.geom, (SELECT "user_profiles"."the_geom" FROM "user_profiles" WHERE "user_profiles"."userAccountId" = :uid)) LIMIT 1;', {replacements: {uid:req.params.uid}, type: models.sequelize.QueryTypes.SELECT})
                    .then(function(currentLocation) {
                        res.status(200).json(currentLocation);
                    })
                    .error(function(err) {
                        res.status(400).json(err);
                    });
            });

        return router;
    };
