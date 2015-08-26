"use strict";

module.exports = function(sequelize, DataTypes) {
    var cacheUserProfile = sequelize.define("cache_user_profile", {
        /*id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true
        },*/
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
        },
        userAccountId: {
            unique:true,
            type: DataTypes.INTEGER
        }
    });

    return cacheUserProfile;
};
