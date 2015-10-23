var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var accessAdmin = require(__dirname+'/../controllers/access_controllers/accessAdmin');
var accessOwner = require(__dirname+'/../controllers/access_controllers/accessOwner');
var accessHasRelationship = require(__dirname+'/../controllers/access_controllers/accessHasRelationship');
var accessPublic = require(__dirname+'/../controllers/access_controllers/accessPublic');
var accessVerify = require(__dirname+'/../controllers/access_controllers/accessVerify');
var Promise = require('bluebird');

module.exports = function(app, router) {
    var User = app.get('models').user_account;
    var ValidateEmail = app.get('models').user_email_validation;

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
                    id: req.params.uid
                }
            }).then(function(data) {
                var response = {result: 'SUCCESS', data: {message:'Deleted '+data+' rows.'}}
                res.status(200).json(response);
            }).catch(function(err) {
                res.status(400).json(err);
            });
        }
    );

    router.get(
        '/user/:uid/confirm/email/:token',
        function(req, res) {
            var result = ValidateEmail.findOne(
                {where: {
                    $and: {
                        userAccountId: req.params.uid,
                        validationKey: decodeURIComponent(req.params.token),
                        keyUsed: false
                    }
                },
                raw:true
            }).then(function(data) {
                if (data !== null) {
                    var validatedUser = ValidateEmail.update({keyUsed:true},
                        {
                            where: {
                                emailValidationId: data.emailValidationId
                            }
                    }).then(function(response, metadata) {
                        return response;
                    }).error(function(err) {
                        return err;
                    });

                    var modifiedUser = User.update({
                        mailVerified: true,
                        status: 'active'
                    },{
                        where: {
                            id: req.params.uid
                        }
                    }).then(function(response, metadata) {
                        return response;
                    }).error(function(err) {
                        return err;
                    });
                    Promise.all([validatedUser, modifiedUser]).spread(function(validatedUserData, modifiedUserData) {
                        if (validatedUserData && modifiedUserData) {
                            res.status(200).json({message:'VALIDATED_ACCOUNT_EMAIL'});
                        } else {
                            res.status(400).json({error:'TOKEN_INVALID_EXPIRED_OR_USED'});
                        }
                    });
                }
            }).error(function(err) {
                return data;
            });
        }
    )

    return router;
};
