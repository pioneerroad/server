"use strict";
var models = require(__dirname);
var Profiles = models.user_profile;

module.exports = function(sequelize, DataTypes) {
    var Message = sequelize.define("messages", {
        messageId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true
        },
        threadId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        senderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        uuid: {
            type: DataTypes.UUID,
            allowNull: false
        },
        location: {
            type: DataTypes.JSONB
        }
    }, {
        tableName: 'messages',
        hooks: {

        }
    });

    return Message;
};
