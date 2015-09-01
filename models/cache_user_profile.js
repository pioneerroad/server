"use strict";

module.exports = function(sequelize, DataTypes) {
    var cacheUserProfile = sequelize.define("cache_user_profile", {
        userAccountId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true
        },
        public_profile: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        friend_profile: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        private_profile: {
            type: DataTypes.JSONB,
            allowNull: true
        }
    });

    return cacheUserProfile;
};
