module.exports = function(userLevel) {
    return function(req, res, done) {
        req.userAccessLevel[userLevel] = true;
    };
}
