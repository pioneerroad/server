"use strict";

var bcrypt = require('bcryptjs');
var SMTPTransporter = require(__dirname+'/../config/nodemailerConfig');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("user_account", {
    username: {
      type: DataTypes.STRING, allowNull: false, unique: true, validate:
        {
          //isEmail: true
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
        is : {args: /^.*(?=.{8,})(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/, msg: 'Password not strong enough'}
      }
    },
    type: {
      type: DataTypes.ENUM, values:['user','administrator'],
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
    }, {classMethods: {
      associate: function(models) {
        User.hasOne(models.user_profile, {
          onDelete: 'cascade', hooks: true
        });
        User.hasOne(models.user_privacy, {
          onDelete: 'cascade', hooks: true
        });
        User.hasOne(models.user_email_validation, {
          onDelete: 'cascade', hooks: true
        });
      }
    },
    instanceMethods: {
      verifyPassword: function(password, fn) {
        bcrypt.compare(password, this.password, function(err, isMatch) {
          if (err) { return err; }
          fn(null, isMatch);
        });
      }
    },
    hooks: {
      beforeUpdate: function (user, options, fn) {
        if (user.password != user._previousDataValues.password) { /* If new password was passed in*/
          bcrypt.genSalt(5, function (err, salt) {
            bcrypt.hash(user.password, salt, function (err, hash) {
              if (err) {
                return err;
              }
              user.password = hash; // Overwrite plain password with hashed version
              fn(null, user); // Return updated user model through callback
            });
          });
        } else {
          user.password = user._previousDataValues.password;
          /* Rewrite previous has to user password field before storing */
          fn(null, user);
        }
      },
      beforeCreate: function (user, options, fn) {
        bcrypt.genSalt(5, function (err, salt) {
          bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) {
              return err;
            }
            user.password = hash; // Overwrite plain password with hashed version
            fn(null, user); // Return updated user model through callback
          });
        });
      },
      afterCreate: function (user, options, fn) { // Init user profile and user privacy records for new user
        var newUser = JSON.stringify(user);
        this.associations.user_profile.target.create({
          userAccountId: user.id
        }).then(function(data) {

        }).error(function(err) {
          return fn(err);
        });
        this.associations.user_privacy.target.create({
          userAccountId: user.id
        }).then(function(data) {
          return fn(null, data);
        }).error(function(err) {
          return fn(err);
        });
        this.associations.user_email_validation.target.create({
          userAccountId: user.id,
          keyExpires: setDate(7),
          validationKey: validationKey('email', user.username)
        }).then(function(data) {
          SMTPTransporter.sendMail({
            from:'no-reply@pioneerroad.com.au',
            to: user.username,
            subject: 'Welcome to Pioneer Road! Please verify your email address',
            text: 'https://pioneerroad.com.au:8090/api/v1/user/'+user.id+'/confirm/email/'+encodeURIComponent(data.validationKey)
          });
        });
      }
    }
  });

  return User;
};

function setDate(numDays) {
  var d = new Date();
  d.setDate(d.getDate()+numDays);
  return d;
}

function validationKey(keyType, data) {
  var salt = bcrypt.genSaltSync(5);
  return bcrypt.hashSync(data, salt);
}
