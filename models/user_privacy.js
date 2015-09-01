module.exports = function(sequelize, DataTypes) {
    var Privacy = sequelize.define("user_privacy", {
        userAccountId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        incognitoMode: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        nickName: {
            type: DataTypes.ENUM('public','friends','private'),
            allowNull: false,
            defaultValue: 'public'
        },
        currentLocation: {
            type: DataTypes.ENUM('public','friends','private'),
            allowNull: false,
            defaultValue: 'public'
        },
        homeTownId: {
            type: DataTypes.ENUM('public','friends','private'),
            allowNull: false,
            defaultValue: 'public'
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
            defaultValue: 'public'
        },
        extendedProfile: {
            type: DataTypes.ENUM('public','friends','private'),
            allowNull: false,
            defaultValue: 'public'
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
