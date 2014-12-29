// @file user.js

// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var UserSchema = mongoose.Schema({
    basic            : {
        username     : {type: String, unique: true},
        password     : {type: String}
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }
});


// Defines hook that will be called on save user. This checks if password needs to be hashed and returns hashed password to be stored.
UserSchema.pre('save', function(callback) {
    var user = this;
    if (!user.isModified('basic.password')) return callback();

    bcrypt.genSalt(5, function(err, salt) {
        if (err) return callback(err);
        
        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return (callback(err));
            user.basic.password = hash;
            callback();
        });
    }); 
});

// create the model for users and expose it to our app
module.exports = mongoose.model('User', UserSchema);