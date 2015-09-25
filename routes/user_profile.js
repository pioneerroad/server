var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var accessAdmin = require(__dirname+'/../controllers/access_controllers/accessAdmin');
var accessOwner = require(__dirname+'/../controllers/access_controllers/accessOwner');
var accessHasRelationship = require(__dirname+'/../controllers/access_controllers/accessHasRelationship');
var accessPublic = require(__dirname+'/../controllers/access_controllers/accessPublic');
var accessVerify = require(__dirname+'/../controllers/access_controllers/accessVerify');

var Promise = require('bluebird');
var models = require(__dirname+'/../models');
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

            photoCtrl.imageUpload(req.body.imageFile, req.params.uid, processedImageSizes, 'profile-photo').then(function(data) {
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

            photoCtrl.imageUpload(req.body.imageFile, req.params.uid, processedImageSizes, 'background-photo').then(function(data) {
                Profile.findOne({
                    where: {userAccountId: req.params.uid}
                }).then(function(profile) {
                    profile.updateAttributes({
                        profileBackgroundPhoto: data
                    }).then(function(newProfileData) {
                        console.log(newProfileData);
                        res.status(200).json({message:"USER_PROFILE_UPDATE_COMPLETE","data":newProfileData});
                    });
                })
            }).error(function(err) {
                console.log(err);
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

        router.put('/temp/photo', function(req, res) {
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
                        where: {userAccountId: 1}
                    }).then(function(profile) {
                        profile.updateAttributes({
                            profilePhoto: data
                        }).then(function(newProfileData) {
                            res.status(200).json({message:"USER_PROFILE_UPDATE_COMPLETE","data":newProfileData});
                        });
                    })
                }).error(function(err) {
                    console.log(err);
                });

        });

        return router;
};
