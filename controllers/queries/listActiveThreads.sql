SELECT
	mt."threadId",
	m."content",
	m."createdAt" as date,
	m."senderId",
	up."profilePhoto",
	up."nickName",
	subscribers.qty as other_subscribers_qty,
	subscribers.subscriber_list as other_subscribers_list,
	(SELECT m."createdAt" > mut."viewDate") as unread_messages
FROM "message_threads" mt
LEFT JOIN "message_user_threads" mut ON mut."threadId" = mt."threadId"
LEFT OUTER JOIN LATERAL (
	SELECT *
	FROM "messages" m2
	WHERE m2."threadId" = mt."threadId"
	ORDER BY m2."createdAt" DESC
	LIMIT 1
) m ON true
LEFT JOIN "user_profiles" up ON up."userAccountId" = m."senderId"
LEFT OUTER JOIN LATERAL (
	SELECT
		count(*) as qty,
		string_agg(up2."nickName", ', ') as subscriber_list
	FROM "message_user_threads" mut2
	LEFT JOIN "user_profiles" up2 ON up2."userAccountId" = mut2."userAccountId"
	WHERE mt."threadId" = mut2."threadId" AND mut2."status" = 'active' AND mut2."userAccountId" != 6
) subscribers ON true
WHERE mut."userAccountId" = 6
AND mut."status" = 'active';
