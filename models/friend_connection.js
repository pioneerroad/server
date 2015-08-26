"use strict";

module.exports = function(sequelize, DataTypes) {
  var Friend = sequelize.define("friend_connection", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true
    },
    status: {
      type: DataTypes.ENUM('request', 'ignore', 'active', 'blocked'),
      allowNull: false,
      defaultValue: 'request'
    },
    // Prototype {location: INT}
    metaData: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    friend_id: {
      type: DataTypes.INTEGER,
      unique: 'compositeIndex' // Composite index prevents multiple identical friend connections
    },
    friended_id: {
      type: DataTypes.INTEGER,
      unique: 'compositeIndex' // Composite index prevents multiple identical friend connections
    }}, {
      hooks: {
        afterUpdate: function(data, options, fn) {

          return fn();
        },
      }
  });

  return Friend;
};
