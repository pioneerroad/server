"use strict";

module.exports = function(sequelize, DataTypes) {
    var Threads = sequelize.define("message_threads", {
        threadId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            primaryKey: true,
            autoIncrement: true,
            comment: "Primary Key"
        },
        initUserId: {
            type: DataTypes.INTEGER,
            comment: "UserId of thread initiator"
        },
        threadContent: {
            type: DataTypes.JSONB,
            allowNull: false,
            comment: "Holds all the data for messages in the thread"
        }
    },
        {
            freezeTableName: true,
            tableName: 'message_threads',
            updatedAt: 'lastMessageTime',
            hooks: {
                afterUpdate: function (user, options, fn) {

            }
        }
    });

    return Threads;
};
