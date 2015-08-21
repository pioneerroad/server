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
// Every user has a user_profile
db.user_profile.belongsTo(db.user_account);
db.user_account.hasOne(db.user_profile);

// Associate each entry in the dataStore_location with a valid user
db.dataStore_location.belongsTo(db.user_account); // Each entry must belong to a valid userId

// Associate each entry in the privacy table with a valid user
db.user_privacy.belongsTo(db.user_account);

// Associate each entry in friend table with valid users
db.user_account.belongsToMany(db.user_account, {as: 'Friended', through: 'friend_connection', foreignKey: 'friended_id'});
db.user_account.belongsToMany(db.user_account, {as: 'Friend', through: 'friend_connection', foreignKey:'friend_id'});

// Asssociate hometowns on the user profile with the dataStore_towns table
db.user_profile.belongsTo(db.dataSet_towns, {foreignKey: 'homeTownId'});

db.sequelize = sequelize;

sequelize.sync();

module.exports = db;
