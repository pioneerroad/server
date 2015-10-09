SELECT
    "relationship_friends"."userA" AS friend,
    "user_profiles"."nickName" AS nickname,
    "user_profiles"."currentLocation" AS "currentLocation",
    "user_profiles"."profilePhoto",
    "user_profiles"."homeTownId",
    "dataSet_towns"."location",
    "dataSet_towns"."state",
    "dataSet_towns"."tourism_region"
FROM "relationship_friends"
    LEFT JOIN "user_profiles" ON "relationship_friends"."userA" = "user_profiles"."userAccountId"
    LEFT JOIN "dataSet_towns" ON "user_profiles"."homeTownId" = "dataSet_towns"."id"
WHERE "relationship_friends"."userB" = :uid
    AND "relationship_friends"."status" = 'active'

UNION

SELECT
    "relationship_friends"."userB" AS friend,
    "user_profiles"."nickName" AS nickname,
    "user_profiles"."currentLocation" AS "currentLocation",
    "user_profiles"."profilePhoto",
    "user_profiles"."homeTownId",
    "dataSet_towns"."location",
    "dataSet_towns"."state",
    "dataSet_towns"."tourism_region"
FROM "relationship_friends"
    LEFT JOIN "user_profiles" ON "relationship_friends"."userB" = "user_profiles"."userAccountId"
    LEFT JOIN "dataSet_towns" ON "user_profiles"."homeTownId" = "dataSet_towns"."id"
WHERE "relationship_friends"."userA" = :uid
    AND "relationship_friends"."status" = 'active';
