module.exports = function(req, res, done) {
    if (res.userAccess === undefined)
        res.userAccess = {};

    var decodedUser = req.decodedUser;

    if (decodedUser.type == 'administrator') {
        res.userAccess.accessAdmin = true;
        return done();
    }
    return done();
}
