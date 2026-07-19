import { error } from '@sveltejs/kit'
import { sql } from 'drizzle-orm'
import { useDb } from '$lib/server/db'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) error(401)

	const db = useDb()
	const rows = await db.execute<{
		client_id: string
		name: string
		projects: string[]
	}>(sql`SELECT * FROM get_freelancer_clients(${locals.user.userId})`)

	return {
		clients: rows.rows.map((r) => ({
			id: r.client_id,
			name: r.name,
			projects: r.projects ?? [],
		})),
	}
}
