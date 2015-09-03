var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var accessAdmin = require(__dirname+'/../controllers/access_controllers/accessAdmin');
var accessOwner = require(__dirname+'/../controllers/access_controllers/accessOwner');
var accessHasRelationship = require(__dirname+'/../controllers/access_controllers/accessHasRelationship');
var accessPublic = require(__dirname+'/../controllers/access_controllers/accessPublic');
var accessVerify = require(__dirname+'/../controllers/access_controllers/accessVerify');

module.exports = function(app, router) {
    var User = app.get('models').user_account;

    router.get(
        '/admin/user/account/list', [jwtAuth, accessAdmin, accessVerify],
        function(req, res) {
            User.findAll({attributes: ['id','username','mobile']})
                .then(function(data) {
                    var response = {result:'SUCCESS', data: data};
                    res.status(200).json(response);
                })
                .catch(function(err) {
                    res.status(400).json(err);
                });
        }
    );

    router.delete(
        '/admin/user/:uid/account/delete', [jwtAuth, accessAdmin, accessVerify],
        function(req, res) {
            User.destroy({
                where: {
                    id: req.params.uid,
                }
            }).then(function(data) {
                var response = {result: 'SUCCESS', data: {message:'Deleted '+data+' rows.'}}
                res.status(200).json(response);
            }).catch(function(err) {
                res.status(400).json(err);
            });
        }
    );

    return router;
};
