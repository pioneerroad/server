module.exports = function(sequelize, DataTypes) {
    var Area = sequelize.define("Area", {
        label: {
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
        type: {
            type: DataTypes.ENUM,
            values:['destination','town','region'],
            allowNull: false,
        }
    });

    return Area;
};