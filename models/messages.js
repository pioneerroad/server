"use strict";

module.exports = function(sequelize, DataTypes) {
    var Messages = sequelize.define("messages_thread", {
        threadId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            primaryKey: true,
            comment: "Primary Key"
        },
        originatorId: {
            type: DataTypes.INTEGER,
            comment: "UserId of thread originator"
        },
        threadContent: {
            type: DataTypes.JSONB,
            allowNull: false,
            comment: "Holds all the data for messages in the thread"
        }
    },
        {
            freezeTableName: true,
            tableName: 'messages_thread',
            updatedAt: 'lastMessageTime',
            hooks: {
                afterUpdate: function (user, options, fn) {

            }
        }
    });

    return Messages;
};
