module.exports = function(req, res, done) {
    if (res.userAccess === undefined)
        res.userAccess = {};

    var decodedUser = req.decodedUser;

    if (decodedUser) {
        res.userAccess.accessPublic = true;
        return done();
    }
    return done();
}
