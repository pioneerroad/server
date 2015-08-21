"use strict";

module.exports = function(sequelize, DataTypes) {
    var dataSetRegions = sequelize.define("dataSet_regions", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                unique: true
            },
            region_name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            state: {
                type: DataTypes.STRING,
                allowNull: false
            }
        },
        {
            freezeTableName: true,
            timestamps: false
        });

    return dataSetRegions;
};
