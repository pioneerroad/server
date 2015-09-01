/**
 * Created by pioneerroad on 31/08/15.
 */

module.exports = {

        friendsNearby: 'SELECT "relationship_friends"."userA" AS friend, "user_profiles"."nickName" AS nickname, "user_profiles"."currentLocation"->\'updatedAt\' as "checkinTime", ST_Distance_Sphere((SELECT "user_profiles"."the_geom" FROM "user_profiles" WHERE "user_profiles"."userAccountId" = 6), "user_profiles"."the_geom") / 1000 as distance FROM "relationship_friends" LEFT JOIN "user_profiles" ON "relationship_friends"."userA" = "user_profiles"."userAccountId" LEFT JOIN "dataSet_towns" ON "dataSet_towns"."id" = "user_profiles"."homeTownId" WHERE "relationship_friends"."userB" = 6 UNION SELECT "relationship_friends"."userB" AS friend, "user_profiles"."nickName" AS nickname, "user_profiles"."currentLocation"->\'updatedAt\' as "checkinTime", ST_Distance_Sphere((SELECT "user_profiles"."the_geom" FROM "user_profiles" WHERE "user_profiles"."userAccountId" = 6), "user_profiles"."the_geom") / 1000 AS distance FROM "relationship_friends" LEFT JOIN "user_profiles" ON "relationship_friends"."userB" = "user_profiles"."userAccountId" LEFT JOIN "dataSet_towns" ON "dataSet_towns"."id" = "user_profiles"."homeTownId" WHERE "relationship_friends"."userA" = 6 AND "relationship_friends"."status" = \'active\' AND ("user_profiles"."currentLocation"->\'updatedAt\')::text = null ORDER BY distance;;',
        pendingFriendRequests: 'SELECT "user_profiles"."userAccountId", "user_profiles"."nickName", "user_profiles"."profilePhoto", "dataSet_towns"."location", "dataSet_towns"."state", "dataSet_towns"."tourism_region" FROM "relationship_friends" LEFT JOIN "user_profiles" ON "relationship_friends"."initiator" = "user_profiles"."userAccountId" LEFT JOIN "dataSet_towns" ON "dataSet_towns"."id" = "user_profiles"."homeTownId" WHERE "relationship_friends"."recipient" = :uid AND "relationship_friends"."status" = \'pending\'',
        activeFriends: 'SELECT "relationship_friends"."userA" AS friend, "user_profiles"."nickName" AS nickname, "user_profiles"."profilePhoto", "user_profiles"."homeTownId", "dataSet_towns"."location", "dataSet_towns"."state", "dataSet_towns"."tourism_region" FROM "relationship_friends" LEFT JOIN "user_profiles" ON "relationship_friends"."userA" = "user_profiles"."userAccountId" LEFT JOIN "dataSet_towns" ON "user_profiles"."homeTownId" = "dataSet_towns"."id" WHERE "relationship_friends"."userB" = :uid AND "relationship_friends"."status" = \'active\' UNION SELECT "relationship_friends"."userB" AS friend, "user_profiles"."nickName" AS nickname, "user_profiles"."profilePhoto", "user_profiles"."homeTownId", "dataSet_towns"."location", "dataSet_towns"."state", "dataSet_towns"."tourism_region" FROM "relationship_friends" LEFT JOIN "user_profiles" ON "relationship_friends"."userB" = "user_profiles"."userAccountId" LEFT JOIN "dataSet_towns" ON "user_profiles"."homeTownId" = "dataSet_towns"."id" WHERE "relationship_friends"."userA" = :uid AND "relationship_friends"."status" = \'active\''
};