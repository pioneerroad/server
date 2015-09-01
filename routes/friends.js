var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var verifyOwnUserAccount = require(__dirname+'/../controllers/verifyOwnUserAccount');
var express = require('express');
var router  = express.Router();
var friendController = require(__dirname+'/../controllers/friendController');
var friendAction = new friendController();
var rawSQL = require(__dirname+'/../controllers/rawQueries');

module.exports = function(app) {
    var User = app.get('models').user_account;
    var Friend = app.get('models').friend_connection;

    /** POST: Initiate a friend request*/
    // 1. Check if relationship already exists in direct or reciprocal form
    // 2. If not, insert request
    // 3. Trigger notification
    router.post(
        '/user/:uid/friends/create', [jwtAuth, verifyOwnUserAccount],
        function(req, res) {
            if (!req.body.recipientId || !req.params.uid) {
                res.status(400).json({error:'FRIEND_REQ_MALFORMED'});
            }
            if (!req.body.placeId) {
                req.body.placeId = null;
            }
            friendAction.createFriendRequest(req.params.uid, req.body.recipientId, {place: req.body.placeId}).then(function(response) {
                res.json(response);
            });
        }
    );

    /** PUT: Accept a friend request*/
    // 3. Insert relationship metadata
    // 4. Trigger notification
    router.put(
      '/user/:uid/friends/accept', [jwtAuth, verifyOwnUserAccount],
        function(req, res) {
            if (!req.body.friendRelationshipId || !req.params.uid) {
                res.status(400).json({error:'MALFORMED_REQUEST'});
            }
            friendAction.acceptFriendRequest(req.params.uid, req.body.friendRelationshipId).then(function(data) {
                res.json(data);
            });
        });

    /** PUT: Ignore a friend request*/
        // 3. Insert relationship metadata
        // 4. Trigger notification
    router.put(
        '/user/:uid/friends/ignore', [jwtAuth, verifyOwnUserAccount],
        function(req, res) {
            if (!req.body.friendRelationshipId || !req.params.uid) {
                res.status(400).json({error:'MALFORMED_REQUEST'});
            }
            friendAction.ignoreFriendRequest(req.params.uid, req.body.friendRelationshipId).then(function(data) {
                res.json(data);
            });
        });

    /** PUT: Change friendship status (block friend) */
    router.put(
        '/user/:uid/friends/block', [jwtAuth, verifyOwnUserAccount],
        function(req, res) {
                if (!req.body.blockId) {
                    res.status(400).json({error:'MALFORMED_REQUEST'})
                }
                friendAction.blockFriend(req.params.uid, req.body.blockId).then(function(data) {
                    res.json(data);
                });
        }
    );

    /** PUT: Change friendship status (unblock friend) */
    router.put(
        '/user/:uid/friends/unblock', [jwtAuth, verifyOwnUserAccount],
        function(req, res) {
            if (!req.body.unblockId) {
                res.status(400).json({error:'MALFORMED_REQUEST'})
            }
            friendAction.unblockFriend(req.params.uid, req.body.unblockId).then(function(data) {
                res.json(data);
            });
        }
    );

    router.get(
        '/user/:uid/friends/pending', [jwtAuth, verifyOwnUserAccount],
        function (req, res) {
            friendAction.pendingFriendList(req.params.uid).then(function(data) {
                res.json(data);
            })
        }
    );

    router.get(
        '/user/:uid/friends/active-list', [jwtAuth, verifyOwnUserAccount],
        function (req, res) {
            friendAction.listActiveFriends(req.params.uid).then(function(data) {
                res.json(data);
            });
        }
    );


    /** Get list of nearby friends */
    router.get(
        '/user/:uid/friends/nearby', [jwtAuth, verifyOwnUserAccount],
        function(req, res) {
            var models = app.get('models');
            var friendList = models.sequelize.query(rawSQL.friendsNearby, {replacements: {uid:req.params.uid}, type: models.sequelize.QueryTypes.SELECT})
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
        '/user/:uid/friends/find', [jwtAuth], function(req, res) {
            if (!req.body.username) {
                res.status(400).json({error:'MALFORMED_REQUEST'});
            }
            friendAction.findFriend(req.body.username).then(function(data) {
                res.json(data);
            })
        });

    return router;

};
