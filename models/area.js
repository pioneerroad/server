module.exports = function(sequelize, DataTypes) {
    var Area = sequelize.define("area", {
        location: {
            type: DataTypes.STRING,
            allowNull: false
        },
        urbanArea: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        postCode: {
            type: DataTypes.STRING,
            isNumeric: true,
            allowNull: false
        },
        category: {
            type: DataTypes.ENUM,
            values:['destination','town','region'],
            allowNull: false,
        },
        population: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        area: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        rvFriendly: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });

    return Area;
};