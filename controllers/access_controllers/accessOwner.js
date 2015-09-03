module.exports = function(req, res, done) {
    if (res.userAccess === undefined)
        res.userAccess = {};

    var requestedById = req.params.uid;
    var resourceOwnerId = req.body.resourceOwnerId ? req.body.resourceOwnerId : req.params.uid ;
    var decodedUser = req.decodedUser;

    if (decodedUser.id == resourceOwnerId) {
        res.userAccess.accessOwner = true;
        return done();
    }

    return done();
}
