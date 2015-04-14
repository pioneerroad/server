module.exports = function(sequelize, DataTypes) {
    var Profile = sequelize.define("Profile", {
            pid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true,
                primaryKey: true,
                autoIncrement: true
            },
            basic: {
                type: DataTypes.JSONB
            },
            vehicle: {
                type: DataTypes.JSONB
            },
            extended: {
                type: DataTypes.JSONB
            }
        });
    return Profile;
};