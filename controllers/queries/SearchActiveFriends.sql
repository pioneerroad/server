SELECT
    "user_profiles"."userAccountId",
	"user_profiles"."profilePhoto",
    "user_profiles"."nickName"
FROM "relationship_friends"
    LEFT JOIN "user_profiles" ON "relationship_friends"."userA" = "user_profiles"."userAccountId"
    LEFT JOIN "member_index" ON "member_index"."userAccountId" = "user_profiles"."userAccountId"
WHERE "relationship_friends"."userB" = :uid
    AND "relationship_friends"."status" = 'active'
	AND "member_index"."data" ILIKE :string

UNION

SELECT
	"user_profiles"."userAccountId",
    "user_profiles"."profilePhoto",
    "user_profiles"."nickName"
FROM "relationship_friends"
    LEFT JOIN "user_profiles" ON "relationship_friends"."userB" = "user_profiles"."userAccountId"
	LEFT JOIN "member_index" ON "member_index"."userAccountId" = "user_profiles"."userAccountId"
WHERE "relationship_friends"."userA" = :uid
    AND "relationship_friends"."status" = 'active'
	AND "member_index"."data" ILIKE :string;
