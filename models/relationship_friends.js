"use strict";

module.exports = function(sequelize, DataTypes) {
  var Friend = sequelize.define("relationship_friends", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'ignore', 'active', 'blocked'),
      allowNull: false,
      defaultValue: 'pending'
    },
    // Prototype {location: INT}
    metaData: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    friendA: {
      type: DataTypes.INTEGER,
      unique: 'compositeIndex' // Composite index prevents multiple identical friend connections
    },
    friendB: {
      type: DataTypes.INTEGER,
      unique: 'compositeIndex' // Composite index prevents multiple identical friend connections
    },
    initiator: {
      type: DataTypes.INTEGER,
      unique: false,
      allowNull: false
    },
    recipient: {
      type: DataTypes.INTEGER,
      unique: false,
      allowNull: false
    },
    lastStatusUpdateBy: {
      type: DataTypes.INTEGER,
      unique: false,
      notNull: true
    }}, {
      hooks: {
        afterUpdate: function(data, options, fn) {

          return fn();
        }
      }
  });

  return Friend;
};