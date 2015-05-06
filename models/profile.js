module.exports = function(sequelize, DataTypes) {
    var UserProfile = sequelize.define("user_profile", {
        fullName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        homeTown: {
            type: DataTypes.INTEGER,
            references: 'areas',
            referenceKey: 'id'
        },
        misc: {
            type: DataTypes.JSONB
        }
    });

    return UserProfile;
};