module.exports = function(models) {

    //models.sequelize.query('ALTER TABLE "areas" ADD COLUMN geog GEOGRAPHY(point, 4326)');
    //models.sequelize.query('ALTER TABLE "places" ADD COLUMN the_geog GEOGRAPHY(point, 4326)');
    //models.sequelize.query('ALTER TABLE "states" ADD COLUMN geog GEOGRAPHY(multipolygon, 4326)');
    models.sequelize.query('ALTER TABLE "dataStore_location" ADD COLUMN the_geom GEOMETRY(point, 900913)');

    /** Create trigger functions*/
    // Initialise user_privacy and user_profile on create new user
    //models.sequelize.query('CREATE OR REPLACE FUNCTION pr_init_user_tables () RETURNS TRIGGER AS $$ BEGIN IF TG_OP = \'INSERT\' THEN INSERT INTO user_privacy ("userAccountId", "createdAt", "updatedAt") VALUES(NEW.id, now(), now()); INSERT INTO user_profiles ("userAccountId", "createdAt", "updatedAt") VALUES(NEW.id, now(), now());END IF;RETURN NEW;END;$$ LANGUAGE plpgsql;');
    //models.sequelize.query('CREATE TRIGGER pr_init_user_tables_trigger AFTER INSERT ON user_accounts FOR EACH ROW EXECUTE PROCEDURE pr_init_user_tables();');
    return models;
}