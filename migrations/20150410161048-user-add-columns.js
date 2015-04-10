"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn('Users','mail',{type: DataTypes.STRING, allowNull:false, unique:true});
    migration.addColumn('Users','cell',{type: DataTypes.STRING, allowNull:false, unique:true});
    migration.addColumn('Users','status',{type: DataTypes.INTEGER, allowNull:false, defaultValue:0});
    done();
  },

  down: function(migration, DataTypes, done) {
    migration.removeColumn('Users','mail');
    migration.removeColumn('Users','cell');
    migration.removeColumn('Users','status');
    done();
  }
};