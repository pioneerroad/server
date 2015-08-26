module.exports = function(sequelize, DataTypes) {
    var UserProfile = sequelize.define("user_profile", {
        /* Holds fullname/nickname */
        nickName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        /* Stores reference to users hometown */
        /*homeTown: {
         type: DataTypes.INTEGER,
         allowNull: true
         },*/
        /* Stores user's most recent profile photo */
        /* Prototype: { */
        profilePhoto: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        profileBackgroundPhoto: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        vehicleProfile: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        extendedProfile: {
            type: DataTypes.JSONB
        },
        currentLocation: {
            type: DataTypes.JSONB,
            allowNull: true
        }}, {
        hooks: {
            afterUpdate: function (data, options, fn) {
                var rebuildCache = require(__dirname+'/../controllers/cache_controllers/cache_user_profile');
                var categories = ['public','friends','private'];
                var cache = Array();

                for (i = 0; i < categories.length; i++) {
                    cache[i] = rebuildCache.writeCache(data.userAccountId, categories[i]);
                }
                return fn();
            }
        }
    });
    return UserProfile;
};
