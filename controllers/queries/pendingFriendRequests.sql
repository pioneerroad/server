SELECT
	"relationship_friends"."id" as "requestId",
	"user_profiles"."userAccountId",
	"user_profiles"."nickName",
	"user_profiles"."profilePhoto",
	"dataSet_towns"."location",
	"dataSet_towns"."state",
	"dataSet_towns"."tourism_region"
FROM "relationship_friends"
	LEFT JOIN "user_profiles" ON "relationship_friends"."initiator" = "user_profiles"."userAccountId"
	LEFT JOIN "dataSet_towns" ON "dataSet_towns"."id" = "user_profiles"."homeTownId"
WHERE "relationship_friends"."recipient" = :uid
	AND "relationship_friends"."status" = 'pending';
