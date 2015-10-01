module.exports = function(models) {

    //models.sequelize.query('ALTER TABLE "areas" ADD COLUMN geog GEOGRAPHY(point, 4326)');
    //models.sequelize.query('ALTER TABLE "places" ADD COLUMN the_geog GEOGRAPHY(point, 4326)');
    //models.sequelize.query('ALTER TABLE "states" ADD COLUMN geog GEOGRAPHY(multipolygon, 4326)');
    //models.sequelize.query('ALTER TABLE "dataStore_location" ADD COLUMN the_geom GEOMETRY(point, 4326)');
    //models.sequelize.query('ALTER TABLE "user_profiles" ADD COLUMN the_geom GEOMETRY(point, 4326)');
    //models.sequelize.query('ALTER TABLE "dataSet_regions" ADD COLUMN the_geom GEOMETRY(point, 4326)');
    //models.sequelize.query('ALTER TABLE "dataSet_towns" ADD COLUMN the_geom GEOMETRY(point, 4326)');

    /** Create trigger functions*/
    return models;
}
