module.exports = function(sequelize, DataTypes) {
    var Vehicles = sequelize.define("vehicle", {
        vehicle_type: {
            type: DataTypes.ENUM('motorhome','caravan'),
            allowNull: false
        }
    });
    return Vehicles;
};