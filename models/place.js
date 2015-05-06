module.exports = function(sequelize, DataTypes) {
    var Place = sequelize.define("place", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        category: {
            type: DataTypes.ENUM,
            values:['reststop','poi','service'],
            allowNull: false
        }
    });

    return Place;
};