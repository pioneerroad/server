SELECT
	"relationship_friends"."userA" AS "friendId",
	"user_profiles"."profilePhoto" as "profilePhoto",
	"user_profiles"."nickName" AS nickname,
	"user_profiles"."currentLocation"->'updatedAt' as "checkinTime",
	ST_Distance_Sphere((SELECT "user_profiles"."the_geom" FROM "user_profiles" WHERE "user_profiles"."userAccountId" = :uid),
	"user_profiles"."the_geom") / 1000 as distance
FROM "relationship_friends"
	LEFT JOIN "user_profiles" ON "relationship_friends"."userA" = "user_profiles"."userAccountId"
	LEFT JOIN "dataSet_towns" ON "dataSet_towns"."id" = "user_profiles"."homeTownId"
WHERE "relationship_friends"."userB" = :uid
	AND "relationship_friends"."status" = 'active'
	AND ST_Distance_Sphere((SELECT "user_profiles"."the_geom" FROM "user_profiles" WHERE "user_profiles"."userAccountId" = :uid), "user_profiles"."the_geom") / 1000 < :distance AND "user_profiles"."the_geom" IS NOT NULL

UNION

SELECT
	"relationship_friends"."userB" AS friend,
	"user_profiles"."profilePhoto" as "profilePhoto",
	"user_profiles"."nickName" AS nickname,
	"user_profiles"."currentLocation"->'updatedAt' as "checkinTime",
	ST_Distance_Sphere((SELECT "user_profiles"."the_geom" FROM "user_profiles" WHERE "user_profiles"."userAccountId" = :uid), "user_profiles"."the_geom") / 1000 AS distance
FROM "relationship_friends"
	LEFT JOIN "user_profiles" ON "relationship_friends"."userB" = "user_profiles"."userAccountId"
	LEFT JOIN "dataSet_towns" ON "dataSet_towns"."id" = "user_profiles"."homeTownId"
WHERE "relationship_friends"."userA" = :uid
	AND "relationship_friends"."status" = 'active'
	AND ST_Distance_Sphere((SELECT "user_profiles"."the_geom" FROM "user_profiles" WHERE "user_profiles"."userAccountId" = :uid), "user_profiles"."the_geom") / 1000 < :distance AND "user_profiles"."the_geom" IS NOT NULL

ORDER BY distance;
