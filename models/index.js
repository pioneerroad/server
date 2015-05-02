"use strict";

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || "development";
var config    = require(__dirname + '/../config/config.json')[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);
var db        = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== basename);
  })
  .forEach(function(file) {
    var model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

/* Set up associations */
// Every user has a UserProfile
db.UserProfile.belongsTo(db.User);
db.User.hasOne(db.UserProfile, {onDelete: 'cascade', constraints:false});

// A state can have many areas, but an area belongs to just one state
db.Area.belongsTo(db.State);
db.State.hasMany(db.Area, {constraints:false});

db.sequelize = sequelize;

module.exports = db;