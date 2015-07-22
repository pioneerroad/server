module.exports = function(sequelize, DataTypes) {
    var Privacy = sequelize.define("user_privacy", {
        incognitoMode: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        currentLocation: {
            type: DataTypes.ENUM('public','friends','private'),
            allowNull: false,
            defaultValue: 'friends'
        },
        homeTown: {
            type: DataTypes.ENUM('public','friends','private'),
            allowNull: false,
            defaultValue: 'friends'
        },
        profilePhoto: {
            type: DataTypes.ENUM('public','friends','private'),
            allowNull: false,
            defaultValue: 'public'
        },
        profileBackgroundPhoto: {
            type: DataTypes.ENUM('public','friends','private'),
            allowNull: false,
            defaultValue: 'public'
        },
        vehicleProfile: {
            type: DataTypes.ENUM('public','friends','private'),
            allowNull: false,
            defaultValue: 'friends'
        },
        extendedProfile: {
            type: DataTypes.ENUM('public','friends','private'),
            allowNull: false,
            defaultValue: 'friends'
        }
    }, {
            freezeTableName: true
        }
    );

    return Privacy;
};