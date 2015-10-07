"use strict";
var models = require(__dirname);

module.exports = function(sequelize, DataTypes) {
  var UserThread = sequelize.define("message_user_threads", {
    userThreadId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true
    },
    userAccountId: {
      type: DataTypes.INTEGER,
      unique: 'userThread'
    },
    threadId: {
      type: DataTypes.INTEGER,
      unique: 'userThread'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active'
    }
  }, {
    updatedAt: 'viewDate',
    tableName: 'message_user_threads',
    hooks: {

    }
  });

  return UserThread;
};
