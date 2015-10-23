var jwtToken = require(__dirname + '/../controllers/jwtGenerate');
var jwtAuth = require(__dirname+'/../controllers/jwtAuth');
var accessAdmin = require(__dirname+'/../controllers/access_controllers/accessAdmin');
var accessOwner = require(__dirname+'/../controllers/access_controllers/accessOwner');
var accessHasRelationship = require(__dirname+'/../controllers/access_controllers/accessHasRelationship');
var accessPublic = require(__dirname+'/../controllers/access_controllers/accessPublic');
var accessVerify = require(__dirname+'/../controllers/access_controllers/accessVerify');

module.exports = function(app, passport, SMTPTransporter, router) {
    var io = app.io;
    var User = app.get('models').user_account;
    var Privacy = app.get('models').user_privacy;
    var Profile = app.get('models').user_profile;
    router.post('/user/create', function(req, res) {
        User.create({
            username: req.body.username,
            password: req.body.password,
            mobile: req.body.mobile
        }).then(function(user) {
            var response = {result:'CREATED_NEW_USER', data: user};
            res.status(200).json(response);
        }).error(function(err) {
            res.status(400).json(err);
        });
    });

    router.post(
        '/user/login',
        passport.authenticate('basic-login', {
            session: false
        }),
        function(req, res) {
            if (req.user.error) {
                res.status(400).send(req.user.error);
                return false;
            }
            if (req.user) { // Username and password OK, give the user a token
                var token = jwtToken(req.user);
                res.status(200).send(token);
            }
        }
    );

    /**
     * Get a single user with UID
     * Note: should only be used for loading a user's own account; different methods required to load other user profiles.
     * @todo compare requested uid with uid encoded in JWT for match */

    router.get(
      '/user/:uid/account/fetch', [jwtAuth, accessAdmin, accessOwner, accessVerify],
        function(req, res) {
            User.findById(req.params.uid).then(function (user) {
                if (user) {
                    var response = {result:'FETCHED_USER_ACCOUNT', data: user};
                    res.status(200).json(response);
                } else {
                    res.json({message: "USER_NOT_FOUND"});
                }
            });
        }
    );

    /**
     * @todo Need to verify email address and password after update */
    router.put(
        '/user/:uid/account/update', [jwtAuth, accessAdmin, accessOwner, accessVerify],
        function (req, res, done) {
            if (req.body.type) {
                res.status(403).json({error:'PROPERTY_CANNOT_BE_CONFIGURED'});
                return done();
            }
            User.update(req.body,
                {where: {id: req.params.uid}, individualHooks: true, returning: true, limit: 1}).then(function (user) {
                    var response = {result: 'UPDATE_USER_ACCOUNT_DATA', data: user};
                    res.status(200).json(response);
                }).catch(function (err) {
                    res.status(400).json(err);
                });
        });

    return router;
};
