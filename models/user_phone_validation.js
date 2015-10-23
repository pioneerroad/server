"use strict";

var bcrypt = require('bcryptjs');

module.exports = function(sequelize, DataTypes) {
    var UserPhoneValidation = sequelize.define("user_phone_validation", {
        phoneValidationId: {
            type:DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            unique: true
        },
        userAccountId: {
            type:DataTypes.INTEGER,
            allowNull: false
        },
        validationKey: {
            type: DataTypes.STRING,
            allowNull: false
        },
        keyUsed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        keyExpires: {
            type: DataTypes.DATE,
            allowNull: false
        },
        validationFails: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },{
        freezeTableName: true,
        hooks: {
            beforeCreate: function(accountValidation, options, fn){
                console.log(accountValidation);
                return fn(null, accountValidation);
            }
        }
    });

    return UserPhoneValidation;
};

function validationKey(keyType, keyLength) {
    var digits = Array();
    for (var i = 0; i < 6; i++) {
        var randomDigit = Math.ceil(Math.random() * (9 - 0) + 0);
        digits.push(randomDigit);
    }
    var validationKey = digits.join("");
    if (keyType == 'emailAddress') {
        bcrypt.genSalt(5, function (err, salt) {
            bcrypt.hash(validationKey, salt, function (err, hash) {
                if (err) {
                    return err;
                }
                validationKey = hash; // Overwrite plain password with hashed version
                fn(null, user); // Return updated user model through callback
            });
        });
    }


    return validationKey;
}
