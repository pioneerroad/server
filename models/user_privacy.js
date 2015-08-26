module.exports = function(sequelize, DataTypes) {
    var Privacy = sequelize.define("user_privacy", {
        incognitoMode: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        nickName: {
            type: DataTypes.ENUM('public','friends','private'),
            allowNull: false,
            defaultValue: 'friends'
        },
        currentLocation: {
            type: DataTypes.ENUM('public','friends','private'),
            allowNull: false,
            defaultValue: 'friends'
        },
        homeTownId: {
            type: DataTypes.ENUM('public','friends','private'),
            allowNull: false,
            defaultValue: 'friends'
        },
        profilePhoto: {
            type: DataTypes.ENUM('public','friends','private'),
            allowNull: false,
            defaultValue: 'public'
        },
        profileBackgroundPhoto: {
            type: DataTypes.ENUM('public','friends','private'),
            allowNull: false,
            defaultValue: 'public'
        },
        vehicleProfile: {
            type: DataTypes.ENUM('public','friends','private'),
            allowNull: false,
            defaultValue: 'friends'
        },
        extendedProfile: {
            type: DataTypes.ENUM('public','friends','private'),
            allowNull: false,
            defaultValue: 'friends'
        }
    }, {
        freezeTableName: true,
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

    return Privacy;
};
