module.exports = function(userLevel) {
    console.log(userLevel);
    return function(req, res, done) {
        req.userAccessLevel[userLevel] = true;
    };
}
