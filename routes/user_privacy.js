var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var matchUser = require(__dirname+'/../controllers/matchUser');
var express = require('express');
var router  = express.Router();

module.exports = function(app) {
    var Privacy = app.get('models').user_privacy;
    /** Endpoint for privacy settings */
    router.put(
        '/user/:uid/privacy/update', [jwtAuth, matchUser],
        function (req, res) {
            Privacy.update(req.body,
            {
                where: {userAccountId: req.params.uid}, individualHooks: true
            }).then(function (data) {
                res.status(200).json(data);
            }).catch(function (err) {
                res.status(400).json(err);
            });
        }
    );

    router.get(
        '/user/:uid/privacy/fetch', [jwtAuth, matchUser],
        function (req, res) {
                Privacy.findAll({where: {userAccountId: req.params.uid}}).then(function (data) {
                    res.status(200).json(data);
                }).catch(function(err) {
                    res.status(400).json(err);
                });
            });

    return router;
}
