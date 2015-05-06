var jwtToken = require(__dirname + '/../controllers/jwtGenerate');
var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var express = require('express');
var router  = express.Router();

module.exports = function(app) {
    var Vehicle = app.get('models').Vehicle;

    /** Endpoint for updating a vehicle */
    router.put(
      '/user/vehicle/update/:uid', [jwtAuth],
        function (req, res) {
            if (user = jwtAuth.isAuthenticated(req, res)) {
                if (user.id == req.params.uid) { /* Check if requesting user (decoded from JWT) is same as requested profile */
                    Vehicle.update(req.body,
                        { where: {UserId:req.params.uid}, individualHooks: true, returning:true, limit:1}).then(function(numRows) {
                            res.status(200).json(numRows);
                        }).catch(function(err) {
                            res.status(400).json(err);
                        });
                } else {
                    res.status(400).json({message:"User may only update their own vehicle"});
                }
            }
        }
    );

    return router;
};