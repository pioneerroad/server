"use strict";

var Promise = require("bluebird");
var fs = require('fs'); Promise.promisifyAll(fs);
var path = require("path");
var basename = path.basename(module.filename);
var queries = {};

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== basename);
    })
    .forEach(function(file) {
        var dir = path.dirname(module.filename);
        var keyName = path.basename(file,'.sql');
        queries[keyName] = fs.readFileSync(dir+'/'+file).toString();
    });

module.exports = queries;
