module.exports = function(sequelize, DataTypes) {
    var Privacy = sequelize.define("privacy", {
        currentLocation: {
            type: DataTypes.ENUM('public','friends','private'),
            allowNull: false,
            defaultValue: 'friends'
        },
        fullName: {
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
            defaultValue: 'friends'
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