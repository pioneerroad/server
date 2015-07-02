var Promise = require('bluebird');
var gm = require('gm').subClass({imageMagick:true});
var fs = require('fs');
var AWS = require('aws-sdk'); AWS.config.update({region: 'ap-southeast-2'}); var s3 = new AWS.S3(); // Load AWS SDK and set default region
Promise.promisifyAll(gm.prototype);
Promise.promisifyAll(fs);
Promise.promisifyAll(s3);

module.exports = {
    getImageSize: function(path) {
        return gm(path).sizeAsync()
            .then(function (ret) {
                return ret;
            })
            .catch(function (err) {
                console.error("Error: " + err);
            });
    },
    getUser: function(uid, User) {
        return User.find({
            where: {id: uid} // Find user from ID passed in HTTP req
        })
    },
    s3Upload: function(params) {
        return s3.uploadAsync(params);
    },
    writeProfileData: function(uid, data, Profile) {
        return Profile.find({
            where: {userId:uid}
        }).success ( function (profile) {
            profile.updateAttributes({
                profilePhoto: Profile.profilePhoto + data
            });
        });
    },
    s3DefaultParams: {

    },
    processedImageDimenions: {

    }
}