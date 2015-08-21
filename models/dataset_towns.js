"use strict";

module.exports = function(sequelize, DataTypes) {
    var dataSetTowns = sequelize.define("dataSet_towns", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false
        },
        postcode: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tourism_region: {
            type: DataTypes.STRING,
            allowNull: true
        }
        /* The rest of the these fields are not required now. Removing from model simplifies queries on this model, but can be added back in later if required. */
        /*latitude: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        longitude: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true
        },
        population: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        area_sqkm: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        time_zone: {
            type: DataTypes.STRING,
            allowNull: true
        } */
    },
        {
            freezeTableName: true,
            timestamps: false
        });

    return dataSetTowns;
};
