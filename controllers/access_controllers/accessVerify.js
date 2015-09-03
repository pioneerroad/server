/** Checks if the user who made the request is the same as the user for which an operation is requested */

var models = require(__dirname+'/../../models');
var Friend = models.relationship_friends;
var User = models.user_account;

module.exports = function(req, res, done) {
    var keys = Array();

    if (res.userAccess) {
        function process(key, value) {
            if (value) {
                keys.push(key);
            }
        }

        (function traverse(values, func) {
            for (var i in values) {
                func.apply(this, [i, values[i]]);
                if (values[i] !== null && typeof(values[i]) == "object") {
                    //going on step down in the object tree!!
                    traverse(values[i], func);
                }
            }
        }) (res.userAccess, process);

        if (keys.length > 0) {
            res.userAccess.granted = true;
            res.userAccess.accessLevel = keys[0];
            return done();
        } else {
            return done('ACCESS_DENIED');
        }
    }
}
