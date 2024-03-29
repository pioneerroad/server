var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var accessAdmin = require(__dirname+'/../controllers/access_controllers/accessAdmin');
var accessOwner = require(__dirname+'/../controllers/access_controllers/accessOwner');
var accessHasRelationship = require(__dirname+'/../controllers/access_controllers/accessHasRelationship');
var accessPublic = require(__dirname+'/../controllers/access_controllers/accessPublic');
var accessVerify = require(__dirname+'/../controllers/access_controllers/accessVerify');

module.exports = function(app, router) {
    var Privacy = app.get('models').user_privacy;
    /** Endpoint for privacy settings */
    router.put(
        '/user/:uid/privacy/update', [jwtAuth, accessAdmin, accessOwner, accessVerify],
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
        '/user/:uid/privacy/fetch', [jwtAuth, accessAdmin, accessOwner, accessVerify],
        function (req, res) {
                Privacy.findAll({where: {userAccountId: req.params.uid}}).then(function (data) {
                    res.status(200).json(data);
                }).catch(function(err) {
                    res.status(400).json(err);
                });
            });

    return router;
}
