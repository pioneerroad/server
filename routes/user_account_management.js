var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var matchUser = require(__dirname+'/../controllers/matchUser');
var express = require('express');
var router  = express.Router();

module.exports = function(app) {
    var User = app.get('models').user_account;

    router.get(
        '/admin/user/account/list',
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
        '/admin/user/:uid/account/delete',
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
