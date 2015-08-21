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
