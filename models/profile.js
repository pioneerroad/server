module.exports = function(sequelize, DataTypes) {
    var UserProfile = sequelize.define("user_profile", {
        fullName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        profilePhoto: {
          type: DataTypes.JSONB,
            allowNull: true
        },
        profileBackgroundPhoto: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        homeTown: {
            type: DataTypes.INTEGER
        },
        misc: {
            type: DataTypes.JSONB
        },
    });
    return UserProfile;
};