"use strict";

var bcrypt = require('bcryptjs');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      },
    },
    instanceMethods: {
      verifyPassword: function(password, fn) {
        bcrypt.compare(password, this.password, function(err, isMatch) {
          console.log(isMatch);
          if (err) { return err; }
          fn(null, isMatch);
        });
      }
    },
    hooks: {
      beforeCreate: function(user, options, fn) {
        bcrypt.genSalt(5, function(err, salt) {
          bcrypt.hash(user.password, salt, function(err, hash) {
              if (err) { return err; }
              user.password = hash; // Overwrite plain password with hashed version
              fn(null, user); // Return updated user model through callback
          });
        })
      }
    }
  });
  return User;
};
