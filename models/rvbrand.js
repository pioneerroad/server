module.exports = function(sequelize, DataTypes) {
    var RVBrand = sequelize.define("rv_brand", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    return RVBrand;
};