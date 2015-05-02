module.exports = function(sequelize, DataTypes) {
    var UserProfile = sequelize.define("UserProfile", {
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        homeTown: {
            type: DataTypes.INTEGER,
            references: 'Areas',
            referenceKey: 'id'
        },
        misc: {
            type: DataTypes.JSONB
        }
    });

    return UserProfile;
};