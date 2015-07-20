module.exports = function(sequelize, DataTypes) {
    var DataStore_Location = sequelize.define("dataStore_location", {
            lat: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            lon: {
                type: DataTypes.FLOAT,
                allowNull: false
            }
        }, {
            updatedAt: false,
            freezeTableName: true
        }
    );

    return DataStore_Location;
};