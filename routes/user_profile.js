var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var accessAdmin = require(__dirname+'/../controllers/access_controllers/accessAdmin');
var accessOwner = require(__dirname+'/../controllers/access_controllers/accessOwner');
var accessHasRelationship = require(__dirname+'/../controllers/access_controllers/accessHasRelationship');
var accessPublic = require(__dirname+'/../controllers/access_controllers/accessPublic');
var accessVerify = require(__dirname+'/../controllers/access_controllers/accessVerify');

var friendController = require(__dirname+'/../controllers/friendController');
var photoUploadController = require(__dirname+'/../controllers/photoUploadController');
var photoCtrl = new photoUploadController();
var friendCtrl = new friendController();
var rawQueries = require(__dirname+'/../controllers/rawQueries');

module.exports = function(app, userSockets, s3, router) {
    var Profile = app.get('models').user_profile;
    var User = app.get('models').user_account;
    var Towns = app.get('models').dataSet_towns;
    var io = app.io;
    /**
     * Get a single user with UID
     * Note: should only be used for loading a user's own account; different methods required to load other user profiles.
     */

    router.post(
        '/user/:uid/profile/fetch', [jwtAuth, accessAdmin, accessOwner, accessHasRelationship, accessPublic, accessVerify],
        function (req, res) {
            var resourceOwnerId = req.body.resourceOwnerId ? req.body.resourceOwnerId : req.params.uid;
            Profile.find({where: {userAccountId: resourceOwnerId},include:[Towns]}).then(function (data) {
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
        '/user/:uid/profile/update/nickname', [jwtAuth, accessAdmin, accessOwner, accessVerify],
        function (req, res) {
            var uid = req.params.uid;
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
                    }).then(function (data) {
                        res.status(200).json(data);
                    }).catch(function (err) {
                        res.status(400).json(err);
                    });
            }
        }
    );

    /**
     * Update homeTown field */
    router.put(
        '/user/:uid/profile/update/hometown', [jwtAuth, accessAdmin, accessOwner, accessVerify],
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
        '/user/:uid/profile/hometown', [jwtAuth, accessAdmin, accessOwner, accessVerify],
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
        '/user/:uid/profile/update/current-location', [jwtAuth, accessAdmin, accessOwner, accessVerify],
        function (req, res) {
                if (!req.body.lat || !req.body.lon) {
                    res.status(400).json({message: "MISSING_OR_MALFORMED_DATA_LOCATION"})
                } else {
                    var coordsObj = {
                        'lat': parseFloat(req.body.lat),
                        'lon': parseFloat(req.body.lon)
                    };

                    // Find the nearest town to the checked in user
                    var nearestTown = models.sequelize.query(rawQueries.nearestTown, {
                        replacements: {
                            lon: req.body.lon,
                            lat: req.body.lat
                        }
                    }).then(function (response) {
                        return response;
                    });

                    // Update the users profile (include closest town in currentLocation object)
                    var profileUpdate = nearestTown.then(function (responseNearestTown) {
                        var data = responseNearestTown[0][0];
                        var location = {
                            currentLocation: {
                                lat: coordsObj.lat,
                                lon: coordsObj.lon,
                                nearestTown: data.location,
                                distanceToNearestTown: data.distance,
                                state: data.state,
                                tourismRegion: data.tourism_region,
                                updatedAt: Date.now()
                            }
                        };

                        return Profile.update(location, {
                            where: {userAccountId: req.params.uid},
                            individualHooks: true,
                            returning: true,
                            limit: 1,
                            raw: true
                        }).spread(function (numRows, data) {
                            return data;
                        });
                    });

                    // Find which friends are nearby to current location
                    var getFriendsNearby = profileUpdate.then(function(data) {
                        var userId = data[0].userAccountId;
                        return friendCtrl.friendsNearby(userId).then(function(data) {
                            return data;
                        });
                    });

                    // Aggregate promises
                    return Promise.all([nearestTown, profileUpdate, getFriendsNearby]).spread(function (nearestTownData, profileUpdateData, friendsNearby) {
                        var profile = profileUpdateData[0];

                        // Iterate through all friends nearby
                        for (var i = 0; i < friendsNearby.length; i++) {
                            // Check userSocket to see if each nearby friend has a current socket connection open
                            for (var j = 0; j < userSockets.length; j++) {
                                if (friendsNearby[i].friendId == userSockets[j].userId) { // If a current socket exists
                                    var friend = { // Compile an object to emit to the friends who are nearby
                                        userAccountId: profile.userAccountId,
                                        nickName: profile.nickName,
                                        profilePhoto: profile.profilePhoto,
                                        distance: friendsNearby[i].distance,
                                        checkinTime: friendsNearby[i].checkinTime
                                    };
                                    io.to(userSockets[j].sessionId).emit('friend nearby', friend); // Send data to connected friends who are nearby
                                }
                            }
                        }
                        res.status(200).json(profileUpdateData); // Return a response via RESTful
                    });
                }
        }
    );

    /** Endpoint for user profile photo upload **/
    router.put('/user/:uid/profile/update/photo', [jwtAuth, accessAdmin, accessOwner, accessVerify],
        function (req, res) {
            var processedImageSizes = {
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

            photoCtrl.imageUpload(req.body.imageFile, 1, processedImageSizes, 'profile-photo').then(function(data) {
                Profile.findOne({
                    where: {userAccountId: req.params.uid}
                }).then(function(profile) {
                    profile.updateAttributes({
                        profilePhoto: data
                    }).then(function(newProfileData) {
                        console.log(newProfileData);
                        res.status(200).json({message:"USER_PROFILE_UPDATE_COMPLETE","data":newProfileData});
                    });
                })
            }).error(function(err) {
                console.log(err);
            });
    });

    /** Endpoint for user profile background photo upload **/
    router.put('/user/:uid/profile/update/background-photo', [jwtAuth, accessAdmin, accessOwner, accessVerify],
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
            console.log(image);
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
                                            params.Key = 'profile-photos/'+userData.id+'/background-photos/'+image.name;
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
                                                    params.Key = 'profile-photos/'+userData.id+'/background-photos/'+image.fileNameBase+'_'+processedImageSizes[imageSize].width+'x'+processedImageSizes[imageSize].height+'.jpg';
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
                            }).then ( function (profile) {
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

    /** Get the nearest town to the current user */
    router.get('/user/:uid/current-location', [jwtAuth, accessAdmin, accessOwner, accessVerify],
        function(req, res) {
            var models = app.get('models');
            var currentLocation = models.sequelize.query('SELECT towns."location", "user_profiles"."currentLocation"->\'updatedAt\' AS timestamp, towns."tourism_region", towns."state", ST_DISTANCE_SPHERE(towns.geom, (SELECT "user_profiles"."the_geom" FROM "user_profiles" WHERE "user_profiles"."userAccountId" = :uid)) / 1000 AS distance FROM "dataSet_towns" AS towns, "user_profiles" WHERE ST_DISTANCE_SPHERE(towns.geom, (SELECT "user_profiles"."the_geom" FROM "user_profiles" WHERE "user_profiles"."userAccountId" = :uid)) < 100000 ORDER BY ST_DISTANCE_SPHERE(towns.geom, (SELECT "user_profiles"."the_geom" FROM "user_profiles" WHERE "user_profiles"."userAccountId" = :uid)) LIMIT 1;', {replacements:{uid:req.params.uid}, type: models.sequelize.QueryTypes.SELECT})
                .spread(function(response, metadata) {
                    res.status(200).json(response);
                })
                .error(function(err) {
                    res.status(400).json(err);
                });
        });

        router.post('/temp/photo/old', function(req, res) {
            var img = req.body.imageFile;



            var imageBuffer = decodeBase64Image(img);
            fs.writeFile(__dirname+'/../temp/uploads/test.jpg', imageBuffer.data, function(err) {
                console.log('ok');
            });

        });

        router.post('/temp/photo', function(req, res) {


        });

        return router;
};
