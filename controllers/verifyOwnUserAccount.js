/** Checks if the user who made the request is the same as the user for which an operation is requested */

module.exports = function(req, res, done) {
    var uid = req.params.uid;
    if (decodedUser = req.decodedUser) {
        if (uid == decodedUser.dataValues.id) {
            return done();
        } else {
            res.status(401).json({message:'ACCOUNT_OWNER_ONLY'});
        }
    };
}