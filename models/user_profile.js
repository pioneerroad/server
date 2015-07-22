module.exports = function(sequelize, DataTypes) {
    var UserProfile = sequelize.define("user_profile", {
        /* Holds fullname/nickname */
        nickName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        /* Stores reference to users hometown */
        homeTown: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        /* Stores user's most recent profile photo */
        /* Prototype: { */
        profilePhoto: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        profileBackgroundPhoto: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        vehicleProfile: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        extendedProfile: {
            type: DataTypes.JSONB
        },
        checkinDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        checkinCoords: {
            type: DataTypes.JSONB,
            allowNull: true
        }
        // checkinCoordinates added by manual sync //
    });
    return UserProfile;
};