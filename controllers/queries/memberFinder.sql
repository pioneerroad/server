SELECT
    "user_profiles"."userAccountId",
	"user_profiles"."profilePhoto",
    "user_profiles"."nickName"
FROM "user_profiles"
    LEFT JOIN "member_index" ON "member_index"."userAccountId" = "user_profiles"."userAccountId"
	WHERE "member_index"."data" ILIKE :string;
