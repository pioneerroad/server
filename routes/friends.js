var Promise = require('bluebird');

var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var accessAdmin = require(__dirname+'/../controllers/access_controllers/accessAdmin');
var accessOwner = require(__dirname+'/../controllers/access_controllers/accessOwner');
var accessHasRelationship = require(__dirname+'/../controllers/access_controllers/accessHasRelationship');
var accessPublic = require(__dirname+'/../controllers/access_controllers/accessPublic');
var accessVerify = require(__dirname+'/../controllers/access_controllers/accessVerify');

var friendController = require(__dirname+'/../controllers/friendController');
var friendCtrl = new friendController();
var rawSQL = require(__dirname+'/../controllers/rawQueries');

module.exports = function(app, userSockets, router) {
    var io = app.io;
    var User = app.get('models').user_account;
    var Friend = app.get('models').friend_connection;
    var Profile = app.get('models').user_profile;

    /** POST: Initiate a friend request*/
    // 1. Check if relationship already exists in direct or reciprocal form
    // 2. If not, insert request
    // 3. Trigger notification/update pending list
    router.post(
        '/user/:uid/friends/create', [jwtAuth, accessAdmin, accessOwner, accessVerify],
        function(req, res) {
            if (!req.body.recipientId || !req.params.uid) {
                res.status(400).json({error:'FRIEND_REQ_MALFORMED'});
            }
            if (!req.body.placeId) {
                req.body.placeId = null;
            }
            var friendRequest = friendCtrl.createFriendRequest(req.params.uid, req.body.recipientId, {place: req.body.placeId}).then(function(response) {
                return response;
            });

            // Get user profile of user who made req so this can be piped to the recipient through socket.io
            var getUserProfile = friendRequest.then(function(data) {
                return Profile.findOne({
                    where: {
                        userAccountId : data.initiator
                    }},{raw:true});
            });


            return Promise.all([friendRequest, getUserProfile]).spread(function(friendRequestData, userProfileData) {
                if (friendRequestData.error) {
                    res.status(400).json(friendRequestData.error);
                } else {
                    for (var j = 0; j < userSockets.length; j++) {

                        if (userSockets[j].userId == friendRequestData.recipient) {
                            io.to(userSockets[j].sessionId).emit('friend request',userProfileData.dataValues);
                        }
                    }
                    res.status(200).json(friendRequestData);
                }
            });
        }
    );

    /** PUT: Accept a friend request*/
    // 3. Insert relationship metadata
    // 4. Trigger notification
    router.put(
      '/user/:uid/friends/accept', [jwtAuth, accessAdmin, accessOwner, accessVerify],
        function(req, res) {
            if (!req.body.friendRelationshipId || !req.params.uid) {
                res.status(400).json({error:'MALFORMED_REQUEST'});
            }
            friendCtrl.acceptFriendRequest(req.params.uid, req.body.friendRelationshipId).then(function(data) {
                res.json(data);
            });
        });

    /** PUT: Ignore a friend request*/
        // 3. Insert relationship metadata
        // 4. Trigger notification
    router.put(
        '/user/:uid/friends/ignore', [jwtAuth, accessAdmin, accessOwner, accessVerify],
        function(req, res) {
            if (!req.body.friendRelationshipId || !req.params.uid) {
                res.status(400).json({error:'MALFORMED_REQUEST'});
            }
            friendCtrl.ignoreFriendRequest(req.params.uid, req.body.friendRelationshipId).then(function(data) {
                res.json(data);
            });
        });

    /** PUT: Change friendship status (block friend) */
    router.put(
        '/user/:uid/friends/block', [jwtAuth, accessAdmin, accessOwner, accessVerify],
        function(req, res) {
                if (!req.body.blockId) {
                    res.status(400).json({error:'MALFORMED_REQUEST'})
                }
                friendCtrl.blockFriend(req.params.uid, req.body.blockId).then(function(data) {
                    res.json(data);
                });
        }
    );

    /** PUT: Change friendship status (unblock friend) */
    router.put(
        '/user/:uid/friends/unblock', [jwtAuth, accessAdmin, accessOwner, accessVerify],
        function(req, res) {
            if (!req.body.unblockId) {
                res.status(400).json({error:'MALFORMED_REQUEST'})
            }
            friendCtrl.unblockFriend(req.params.uid, req.body.unblockId).then(function(data) {
                res.json(data);
            });
        }
    );

    router.get(
        '/user/:uid/friends/pending', [jwtAuth, accessAdmin, accessOwner, accessVerify],
        function (req, res) {
            friendCtrl.pendingFriendList(req.params.uid).then(function(data) {
                res.json(data);
            })
        }
    );

    router.get(
        '/user/:uid/friends/active', [jwtAuth, accessAdmin, accessOwner, accessVerify],
        function (req, res) {
            friendCtrl.listActiveFriends(req.params.uid).then(function(data) {
                res.json(data);
            });
        }
    );


    /** Get list of nearby friends */
    router.get(
        '/user/:uid/friends/nearby', [jwtAuth, accessAdmin, accessOwner, accessVerify],
        function(req, res) {
            if (!req.params.uid) {
                res.status(400).json({error:'MALFORMED_REQUEST'});
            }
            friendCtrl.friendsNearby(req.params.uid)
                .then(function(friends) {
                    res.status(200).json(friends);
                })
                .error(function(err) {
                    res.status(400).json(err);
                });

        }
    );

    /** Find a friend by username/email ID or phone number **/
    router.post(
        '/user/:uid/friends/find', [jwtAuth, accessPublic, accessVerify], function(req, res) {
            if (!req.body.username) {
                res.status(400).json({error:'MALFORMED_REQUEST'});
            }
            friendCtrl.findFriend(req.body.username).then(function(data) {
                res.json(data);
            })
        });

    return router;

};
