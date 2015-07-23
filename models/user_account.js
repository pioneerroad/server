"use strict";

var bcrypt = require('bcryptjs');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("user_account", {
    username: {
      type: DataTypes.STRING, allowNull: false, unique: true, validate:
        {
          isEmail: true
        },
      comment: "Username is an email address"
      },
    mailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue:false,
      comment: "Flag to indicate mail verification status"
    },
    password: {
      type: DataTypes.STRING, allowNull: false, validate: {
        is : {args: /^.*(?=.{8,})(?=.*d)(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/, msg: 'Password not strong enough'}
      }
    },
    type: {
      type: DataTypes.ENUM, values:['user','business'],
      allowNull: false,
      defaultValue: 'user'
    },
    mobile: {
      type: DataTypes.STRING, unique: true, allowNull: false, validate: {
        isNumeric: true
      }
    },
    mobileVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue:false,
      comment: "Flag to indicate cell number verification status"
    },
    status: {
      type: DataTypes.ENUM, values:['preactive','active','blocked','suspended','userDeleted'],
      allowNull: false,
      defaultValue: 'preactive'
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
      beforeUpdate: function(user, options, fn) {
        if (user.password != user._previousDataValues.password) { /* If new password was passed in*/
          bcrypt.genSalt(5, function(err, salt) {
            bcrypt.hash(user.password, salt, function(err, hash) {
              if (err) { return err; }
              user.password = hash; // Overwrite plain password with hashed version
              fn(null, user); // Return updated user model through callback
            });
          });
        } else {
          user.password = user._previousDataValues.password; /* Rewrite previous has to user password field before storing */
          fn(null, user);
        }
      },
      beforeCreate: function(user, options, fn) {
        bcrypt.genSalt(5, function(err, salt) {
          bcrypt.hash(user.password, salt, function(err, hash) {
              if (err) { return err; }
              user.password = hash; // Overwrite plain password with hashed version
              fn(null, user); // Return updated user model through callback
          });
        });
      },
      afterCreate: function(user, fn) {

      }
    }
  });

  return User;
};