"use strict";

var bcrypt = require('bcryptjs');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: {
      type: DataTypes.STRING, allowNull: false, unique: true, validate:
        { isAlphanumeric: true, stringLength: function(value) {
          if (value.length > 12 ) {
            throw new Error("Username too long");
          }
        }}
      },
    password: {
      type: DataTypes.STRING, allowNull: false, validate: {
        is : {args: /^.*(?=.{8,})(?=.*d)(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/, msg: 'Password not strong enough'}
      }
    },
    mail: {
      type: DataTypes.STRING, allowNull: false, unique: true, validate: {
        isEmail: true
      }
    },
    cell: {
      type: DataTypes.STRING, allowNull: false, validate: {
        isNumeric: true
      }
    },
    status: {
      type: DataTypes.INTEGER, allowNull: false, defaultValue: 0
      }
    },
    {classMethods: {
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
