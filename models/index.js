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
db.user_profile.belongsTo(db.user);
db.user.hasOne(db.user_profile, {onDelete: 'cascade', constraints:false});

// A state can have many areas, but an area belongs to just one state
db.area.belongsTo(db.state);
db.state.hasMany(db.area, {constraints:false})

// A user can have many vehicles, but a vehicle must belong to one user
db.vehicle.belongsTo(db.user);
db.user.hasMany(db.vehicle);

// A vehicle can have one type
db.rv_brand.hasMany(db.vehicle);

db.sequelize = sequelize;

module.exports = db;