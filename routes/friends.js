var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
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
        '/user/:uid/create/friend-request',
        function(req, res) {

        }
    );

    /** PUT: Accept a friend request*/
    // 1. Change status of friend request from request -> active
    // 2. Add reciprocal request
    // 3. Insert relationship metadata
    // 4. Trigger notification
    router.put(
      '/user/:uid/accept/friend-request/:reqId',
        function(req, res) {

        }
    );

    /** PUT: Change status (Eg. block/unblock friend) */
    router.put(
        '/user/:uid/friend/update-state/:reqId',
        function(req, res) {

        }
    );

    return router;
};
