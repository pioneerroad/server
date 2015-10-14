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
            comment: "userAccountId of thread initiator"
        }
    },
        {
            tableName: 'message_threads'
    });

    return Threads;
};
