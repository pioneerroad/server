module.exports = function(sequelize, DataTypes) {
    var UserProfile = sequelize.define("user_profile", {
        /* Holds fullname/nickname */
        userAccountId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        nickName: {
            type: DataTypes.STRING,
            allowNull: true
        },
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
            allowNull: true,
            defaultValue: {lat:{},lon:{},updatedAt:{}}}
        }, {
            hooks: {
                beforeUpdate: function(data, options, fn) {
                    if (data._previousDataValues.currentLocation !== null) {
                        // If location has changed, then log it in dataStore_location
                        if (data.dataValues.currentLocation.lat != data._previousDataValues.currentLocation.lat || data.dataValues.currentLocation.lon != data._previousDataValues.currentLocation.lon) {
                            console.log(data.dataValues);
                            sequelize.query('INSERT INTO "dataStore_location" (lat, lon, "userAccountId", "createdAt", the_geom) VALUES (:lat, :lon, :uid, now(), ST_SetSRID(ST_MakePoint(:lon, :lat),4326))', {
                                replacements: {
                                    uid: parseInt(data.dataValues.userAccountId),
                                    lon: data.dataValues.currentLocation.lon,
                                    lat: data.dataValues.currentLocation.lat},
                                type: sequelize.QueryTypes.INSERT})
                                .then(function(response) {
                                    console.log(response);
                                    sequelize.query('UPDATE "user_profiles" SET the_geom = ST_SetSRID(ST_MakePoint(:lon, :lat),4326) WHERE "userAccountId" = :uid;',{
                                        replacements: {
                                            lat: data.dataValues.currentLocation.lat,
                                            lon: data.dataValues.currentLocation.lon,
                                            uid: data.dataValues.userAccountId
                                        }})
                                        .then(function(response) {
                                            console.log(response);
                                            fn(null, data);
                                        })
                                        .error(function(err) {
                                            console.log(err);
                                            fn(err);
                                        });
                                }).error(function(err) {
                                    console.log(err);
                                    fn();
                                });
                        } else {
                            return fn(null, data);
                        }
                    } else {
                        return fn(null, data);
                    }
                },
                afterUpdate: function (data, options, fn) {
                    // Rebuild profile cache
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
