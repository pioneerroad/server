SELECT
    towns."location", towns."tourism_region",
    towns."state", ST_Distance_Sphere(towns.geom,
    ST_SETSRID(st_makepoint(:lon, :lat),4326)) / 1000 as distance
    FROM "dataSet_towns" AS towns
ORDER BY ST_Distance_sphere(towns.geom, st_setsrid(st_makepoint(:lon, :lat),4326)) LIMIT 1;
