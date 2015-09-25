var Promise = require('bluebird');
var gm = require('gm').subClass({imageMagick:true}); Promise.promisifyAll(gm.prototype);
var fs = require('fs'); Promise.promisifyAll(fs);
var AWS = require('aws-sdk'); AWS.config.update({region: 'ap-southeast-2'}); var s3 = new AWS.S3(); Promise.promisifyAll(s3); // Load AWS SDK and set default region
var models = require(__dirname+'/../models');

var params = require('../config/awsS3config.js').userContent.images; params.mimeType = 'image/jpeg';
//var imageUploadS3 = require('../controllers/imageUploadS3');

module.exports = function(imageData, uid, outputDims) {

    this.imageUpload = function(imageData, uid, outputDims, category) {

        var tempFiles = generateFileNames(outputDims);
        var originalTempFile = writeTempFile(imageData, tempFiles.pathToFile);
        var originalImageSize = getImageSize(tempFiles.pathToFile);
        var currentUser = getCurrentUser(uid);
        var profileDataObj = buildProfileData(tempFiles, outputDims);


        return Promise.all([originalTempFile, originalImageSize, currentUser]).spread(function (originalTempFileData, originalImageSizeData, currentUserData) {
            var s3Path = 'profile-photos/'+currentUserData.id+'/'+category+'/';
            outputDims.original = {"width":originalImageSizeData.width, "height":originalImageSizeData.height}; // Add original filesize to outputDims
            for (var key in outputDims) {
                if (outputDims.hasOwnProperty(key)) {
                    (function (imageSize) {
                        if (imageSize == 'original') {
                            params.ContentType = 'image/jpeg';
                            params.Key = s3Path+tempFiles.originalFileName;
                            params.Body = fs.createReadStream(tempFiles.pathToFile);
                            s3Upload(params);
                        } else {
                            imageResize(fs.createReadStream(tempFiles.pathToFile), tempFiles.basePath+tempFiles.variants[imageSize], outputDims[key]).then(function(data) {
                                params.ContentType = 'image/jpeg';
                                params.Key = s3Path+tempFiles.variants[imageSize];
                                params.Body = fs.createReadStream(tempFiles.basePath+tempFiles.variants[imageSize]);
                                s3Upload(params);
                            });
                        }
                    }) (key);
                }
            }
        }).then(function(done) {
            return buildProfileData(tempFiles, outputDims);
        }).error(function(error) {
            return error;
        });
    }
};

/* Private Methods */
function writeTempFile(imageData, path) {
    var imageBuffer = decodeBase64Image(imageData);
    var writeTempFile = fs.writeFileAsync(path, imageBuffer.data).then(function(data) {
        return {message:'done'};
    }).error(function(err) {
        return {error:'error'};
    });
    return writeTempFile;
}

function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

function getImageSize(path) {
    return gm(path).sizeAsync()
        .then(function (data) {
            return data;
        })
        .catch(function (err) {
            return err;
        });
}

function generateFileNames (dimensions) {
    var basePath = __dirname+'/../temp/uploads/';
    var timestamp = Date.now();
    var ext = '.jpg';

    var filePaths = {
        baseFileName: timestamp,
        basePath: basePath,
        pathToFile: basePath+timestamp+ext,
        originalFileName: timestamp+ext,
        variants: {}
    };

    for (var key in dimensions) {
        if (dimensions.hasOwnProperty(key)) {
            (function (imageSize) {
                filePaths.variants[imageSize] = timestamp+'_'+dimensions[imageSize].width+'x'+dimensions[imageSize].height+'.jpg';
            }) (key);
        }
    }

    return filePaths;
}

function getCurrentUser(uid) {
    var User = models.user_account;
    return User.findById(uid, {raw:true}).then(function(data) {
        return data;
    }).error(function(error) {
        return error;
    });
}

function imageResize(fileStream, path, dimensions) {
    return gm(fileStream)
        .resize(dimensions.width)
        .writeAsync(path)
        .then(function(data) {
            return data;
        })
        .error(function(error) {
            return error;
        });
}

function s3Upload(params) {
    return s3.uploadAsync(params).then(function(data) {
        return data;
    }).error(function(error) {
        return error;
    });
}

function buildProfileData(tempFiles, outputDims) {
    profileDataObj = {};
    for (var key in outputDims) {
        if (outputDims.hasOwnProperty(key)) {
            (function (imageSize) {
                profileDataObj[imageSize] = tempFiles.baseFileName+'_'+outputDims[imageSize].width+'x'+outputDims[imageSize].height+'.jpg';
            }) (key);
        }
    }
    return profileDataObj;
}
