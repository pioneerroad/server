module.exports = function(sequelize, DataTypes) {
    var UserProfile = sequelize.define("user_profile", {
        fullName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        profilePhoto: {
          type: DataTypes.STRING,
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