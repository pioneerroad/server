var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var matchUser = require(__dirname+'/../controllers/matchUser');
var express = require('express');
var router  = express.Router();

module.exports = function(app) {
    var User = app.get('models').user_account;
    var Friend = app.get('models').friend_connection;

    /** POST: Initiate a friend request*/
    // 1. Check if relationship already exists in direct or reciprocal form
    // 2. If not, insert request
    // 3. Trigger notification
    router.post(
        '/user/:uid/friend-request/create', [jwtAuth, matchUser],
        function(req, res) {
            if (req.body.friendReqId != req.params.uid) {
                Friend.create({
                    friended_id: req.body.friendReqId,
                    friend_id: req.params.uid,
                }).then(function(friendConnection) {
                    var response = {result:'CREATED_NEW_FRIEND_REQUEST', data: friendConnection};
                    res.status(200).json(response);
                }).error(function(err) {
                    res.status(400).json(err);
                });
            } else {
                res.status(400).json({response:'CANNOT_BE_FRIENDS_WITH_YOURSELF'});
            }
        }
    );

    /** PUT: Accept a friend request*/
    // 1. Change status of friend request from request -> active
    // 2. Add reciprocal request
    // 3. Insert relationship metadata
    // 4. Trigger notification
    router.put(
      '/user/:uid/friend-request/accept/:reqId', [jwtAuth, matchUser],
        function(req, res) {
            Friend.update(
                {status:'active'},
                {where:[{id:req.params.reqId},{friended_id:req.params.uid}]}
            ).then(function(friendConnection) {
                    res.status(200).json({response:'UPDATE_SUCCESSFUL','numRows':friendConnection[0]});
                }).error(function(err) {
                    res.status(400).json(err);
                });
        }
    );

    /** PUT: Change friendship status (block friend) */
    router.put(
        '/user/:uid/friend-request/block/:friendId', [jwtAuth, matchUser],
        function(req, res) {
                Friend.update(
                    {status:'blocked'},
                    {where:[{friend_id:req.params.uid},{friended_id:req.params.friendId}]}
                ).then(function(friendConnection) {
                        if (friendConnection[0] != 1) {
                            res.status(400).json({message:'NO_RECORDS_UPDATED'});
                        } else {
                            res.status(200).json({response:'UPDATE_SUCCESSFUL'});
                        }
                    }).error(function(err) {
                        res.status(400).json(err);
                    });
        }
    );

    /** PUT: Change friendship status (unblock friend) */
    router.put(
        '/user/:uid/friend-request/unblock/:friendId', [jwtAuth, matchUser],
        function(req, res) {
            Friend.update(
                {status:'active'},
                {where:[{friend_id:req.params.uid},{friended_id:req.params.friendId}]}
            ).then(function(friendConnection) {
                    if (friendConnection[0] != 1) {
                        res.status(400).json({message:'NO_RECORDS_UPDATED'});
                    } else {
                        res.status(200).json({response:'UPDATE_SUCCESSFUL'});
                    }
                }).error(function(err) {
                    res.status(400).json(err);
                });
        }
    );

    /** Get list of nearby friends */
    router.get(
        '/user/:uid/friends-nearby', [jwtAuth, matchUser],
        function(req, res) {
            var models = app.get('models');
            var friendList = models.sequelize.query('SELECT "user_profiles"."userAccountId", "user_profiles"."nickName", "user_profiles"."checkinCoords"->\'updatedAt\' as checkinTime, "user_profiles"."profilePhoto", ST_Distance_Sphere((SELECT "user_profiles"."the_geom" FROM "user_profiles" WHERE "user_profiles"."userAccountId" = :uid), "user_profiles"."the_geom") / 1000 AS distance FROM "user_profiles" LEFT JOIN "friend_connections" ON "friend_connections"."friended_id" = "user_profiles"."userAccountId" WHERE "friend_connections"."friend_id" = :uid AND "friend_connections"."status" = \'active\' ORDER BY "distance"', {replacements: {uid:req.params.uid}, type: models.sequelize.QueryTypes.SELECT})
                .then(function(friends) {
                    res.status(200).json(friends);
                })
                .error(function(err) {
                   res.status(400).json(err);
                });
        }
    );

    return router;
};
