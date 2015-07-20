var express = require('express');
var router  = express.Router();

module.exports = function(app) {
    /** Endpoint for hometown selection (autosuggest on client) */
    router.get(
        '/town/select/:input', function (req, res) {
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


