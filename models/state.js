module.exports = function(sequelize, DataTypes) {
    var State = sequelize.define("state", {
        label: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    return State;
};