var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var accessAdmin = require(__dirname+'/../controllers/access_controllers/accessAdmin');
var accessOwner = require(__dirname+'/../controllers/access_controllers/accessOwner');
var accessHasRelationship = require(__dirname+'/../controllers/access_controllers/accessHasRelationship');
var accessPublic = require(__dirname+'/../controllers/access_controllers/accessPublic');
var accessVerify = require(__dirname+'/../controllers/access_controllers/accessVerify');

module.exports = function(app, router) {
    /** Endpoint for hometown selection (autosuggest on client) */
    router.get(
        '/town/select/:input', [jwtAuth, accessPublic, accessVerify], function (req, res) {
            var test = app.get('models');
            var testing = test.sequelize.query("SELECT * FROM town_index WHERE label ILIKE '%" + req.params.input + "%'", {type: test.sequelize.QueryTypes.SELECT}).then(function (towns, err) {
                if (towns) {
                    res.status(200).json(towns);
                } else {
                    res.status(400).json(err);
                }
            });
        }
    );

    return router;
}


