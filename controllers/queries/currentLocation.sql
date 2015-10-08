SELECT
    towns."location",
    "user_profiles"."currentLocation"->'updatedAt' AS timestamp,
    towns."tourism_region",
    towns."state",
    ST_DISTANCE_SPHERE(towns.geom, (SELECT "user_profiles"."the_geom" FROM "user_profiles" WHERE "user_profiles"."userAccountId" = :uid)) / :distance AS distance
FROM
    "dataSet_towns" AS towns,
    "user_profiles"
WHERE ST_DISTANCE_SPHERE(towns.geom, (SELECT "user_profiles"."the_geom" FROM "user_profiles" WHERE "user_profiles"."userAccountId" = :uid)) < :distance
ORDER BY ST_DISTANCE_SPHERE(towns.geom, (SELECT "user_profiles"."the_geom" FROM "user_profiles" WHERE "user_profiles"."userAccountId" = :uid)) LIMIT 1;
