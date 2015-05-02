module.exports = function(sequelize, DataTypes) {
    var State = sequelize.define("State", {
        label: {
            type: DataTypes.STRING,
            allowNull: false
        },
        abbreviation: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    });

    return State;
};