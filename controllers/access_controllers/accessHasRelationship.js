var Friend = require(__dirname+'/../../models').relationship_friends;

module.exports = function(req, res, done) {
    if (res.userAccess === undefined)
        res.userAccess = {};

    var requestedById = req.params.uid;
    var resourceOwnerId = req.body.resourceOwnerId ? req.body.resourceOwnerId : req.params.uid;

    Friend.findAndCount({
        where: {
            $or: [
                {$and: {userA: requestedById, userB: resourceOwnerId}},
                {$and: {userB: requestedById, userA: resourceOwnerId}}
            ],
            $and: {status:'active'}
        }
    }).then(function(data) {
        if (data.count > 0) {
            res.userAccess.hasRelationship = true;
            return done();
        }
        return done();
    }).error(function(err) {
        return done();
    });
}
