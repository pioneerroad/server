SELECT
	DISTINCT ON ("message_threads"."threadId")
	"message_threads"."threadId",
	SELECT_FIRST("user_profiles"."userAccountId") as subscriberId,
	SELECT_FIRST("user_profiles"."nickName") as subscriber_nickname,
	string_agg("user_profiles"."nickName", ', ') as subscriber_list,
	COUNT("message_user_threads"."userThreadId") as qty,
	SELECT_FIRST("user_profiles"."profilePhoto") as photo,
	jsonb_array_elements("message_threads"."threadContent")->'message' as message,
	jsonb_array_length("message_threads"."threadContent") as message_count,
	"message_threads"."lastMessageTime" as lastMessageTime
FROM "message_threads"
	LEFT JOIN "message_user_threads" ON "message_user_threads"."threadId" = "message_threads"."threadId"
	LEFT JOIN "user_profiles" ON "message_user_threads"."userAccountId" = "user_profiles"."userAccountId"
WHERE "message_threads"."threadId"
	IN (SELECT "message_user_threads"."threadId" FROM "message_user_threads" WHERE "message_user_threads"."userAccountId" = :uid)
	AND "message_user_threads"."status" = 'active'
GROUP BY "message_threads"."threadId";
