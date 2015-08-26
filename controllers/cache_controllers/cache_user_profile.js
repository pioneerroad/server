var models = require(__dirname+'/../../models');
var Profile = models.user_profile;
var Privacy = models.user_privacy;
var cacheProfile = models.cache_user_profile;

module.exports = {
    writeCache: function(userId, category) {
        return buildCache(userId, category).then(function(data) {
            return Profile.findAll({
                    where: {userAccountId: userId},
                    attributes:data}) // Fetch data for current user, but only for keys that were returned for this category
                .then(function(result) {
                    var updateColumn;

                    switch(category) { // Convert categories into column names
                        case 'private': updateColumn = 'private_profile';
                            break;
                        case 'friends': updateColumn = 'friend_profile';
                            break;
                        case 'public': updateColumn = 'public_profile';
                    }
                    var updateData = {}; updateData[updateColumn] = result[0]; updateData.userAccountId = userId; // Build JSON object to update DB

                    return cacheProfile.upsert(updateData, { // Update cache
                        where:{userAccountId:userId}
                    }).then(function(result) {
                        return result;
                    });
                });
        });
    }
};

var buildCache = function(userId, category) {
    var categories = ['private','friends','public']; // Define privacy options in order of visibility (least visible to most visible)
    var pos = categories.indexOf(category); // Get position of current category
    var keys = Array();

    return Privacy.find({where:{userAccountId: userId}}).then(function(data) {
        var dataValues = data.dataValues;

        for (var i = pos; i < categories.length; i++) { // Iterate through the categories starting with current category

            function process(key, value) { // Gets called for each member of the object
                if (value == categories[i]) // If value (Eg. public) matches the current category, it's added to a list of keys
                 keys.push(key);
            }

            (function traverse(values, func) {
                for (var i in values) {
                    func.apply(this, [i, values[i]]);
                    if (values[i] !== null && typeof(values[i]) == "object") {
                        //going on step down in the object tree!!
                        traverse(values[i], func);
                    }
                }
            }) (dataValues, process) // Pass values fetched from DB in to traverse the returned object
        }
        return keys; // Return keys

    });
}
