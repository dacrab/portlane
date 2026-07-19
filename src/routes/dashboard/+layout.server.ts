import { redirect } from '@sveltejs/kit'
import { sql } from 'drizzle-orm'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/login')
	if (locals.user.role === 'client') redirect(303, '/portal')

	const db = useDb()
	const since = sql`COALESCE((SELECT last_read_comments_at FROM ${schema.users} WHERE id = ${locals.user.userId}), '-infinity'::timestamptz)`

	const comments = await db.execute<{ id: string }>(sql`
		SELECT c.id FROM ${schema.comments} c
		JOIN ${schema.projects} p ON p.id = c.project_id
		WHERE p.freelancer_id = ${locals.user.userId}
			AND c.author_id <> ${locals.user.userId}
			AND c.created_at > ${since}
	`)

	return { user: locals.user, unreadComments: comments.rows.length }
}
