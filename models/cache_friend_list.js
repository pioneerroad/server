"use strict";

module.exports = function(sequelize, DataTypes) {
    var cacheFriendList = sequelize.define("cache_friend_list", {
        friend_list: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        userAccountId: {
            unique: true,
            type: DataTypes.INTEGER
        }
    }, {
        freezeTableName: true
    });
    return cacheFriendList;
};
