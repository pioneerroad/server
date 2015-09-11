"use strict";
var models = require(__dirname);
var Profiles = models.user_profiles;
var User = models.user_accounts;

var md5 = require('md5');

module.exports = function(sequelize, DataTypes) {
  var Friend = sequelize.define("relationship_friends", {
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
    userA: {
      type: DataTypes.INTEGER,
      unique: 'userPair'
    },
    userB: {
      type: DataTypes.INTEGER,
      unique: 'userPair'
    },
    initiator: {
      type: DataTypes.INTEGER,
      unique: false,
      allowNull: false,
      references: {
        model: "user_accounts",
        key: "id"
      }
    },
    recipient: {
      type: DataTypes.INTEGER,
      unique: false,
      allowNull: false,
      references: {
        model: "user_accounts",
        key: "id"
      }
    },
    lastStatusUpdateBy: {
      type: DataTypes.INTEGER,
      unique: false,
      notNull: true
    }
  }, {
    hooks: {
      beforeCreate: function(friend, options, fn) {
        var orderedPair = createOrderedPair(friend.initiator, friend.recipient);
        friend.userA = orderedPair[0];
        friend.userB = orderedPair[1];
        fn(null, friend);
      }
    }
  });

  return Friend;
};

function createOrderedPair(friendA, friendB) {
  if (friendA == friendB) {
    return false;
  }
  var unorderedPair = [friendA, friendB];
  var orderedPair = unorderedPair.sort(function(a,b){return a - b;});

  return orderedPair;
}
