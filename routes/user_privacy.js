var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var matchUser = require(__dirname+'/../controllers/matchUser');
var express = require('express');
var router  = express.Router();

module.exports = function(app) {
    var Privacy = app.get('models').user_privacy;
    /** Endpoint for privacy settings */
    router.put(
        '/user/:uid/privacy/update', [jwtAuth],
        function (req, res) {
            if (user = jwtAuth.isAuthenticated(req, res)) {
                if (user.id == req.params.uid) { /* Check if requesting user (decoded from JWT) is same as requested profile */
                    Privacy.update(req.body,
                    {
                        where: {userAccountId: req.params.uid},
                        individualHooks: true,
                        limit: 1
                    }).then(function (data) {
                        res.status(200).json(data);
                    }).catch(function (err) {
                        res.status(400).json(err);
                    });
                } else {
                    res.status(400).json({message: "User may only create their own privacy settings"});
                }
            }
        }
    );

    router.get(
        '/user/:uid/privacy/fetch', [jwtAuth],
        function (req, res) {
            if (user = jwtAuth.isAuthenticated(req, res)) {
                if (user.id == req.params.uid) { /* Check if requesting user (decoded from JWT) is same as requested profile */
                    Privacy.find({where: {userAccountId: req.params.uid}}).then(function (data) {
                        if (data) {
                            res.status(200).json(data);
                        } else {
                            res.json({message: "DATA_NOT_FOUND"});
                        }
                    });
                } else {
                    res.status(400).json({message: "User may only create their own privacy settings"});
                }
            }
        }
    );

    return router;
}