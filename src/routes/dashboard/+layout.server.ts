import { redirect } from '@sveltejs/kit'
import { sql } from 'drizzle-orm'
import { useDb } from '$lib/server/db'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/login')
	if (locals.user.role === 'client') redirect(303, '/portal')

	const db = useDb()
	const unread = await db.execute<{
		id: string
		body: string
		created_at: string
		author_name: string
		project_id: string
		project_name: string
	}>(sql`SELECT * FROM get_unread_comments(${locals.user.userId})`)

	return {
		user: locals.user,
		unreadComments: unread.rows.length,
		unreadCommentRows: unread.rows ?? [],
	}
}
