import { error } from '@sveltejs/kit'
import { and, desc, eq, ne, sql } from 'drizzle-orm'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) error(401)
	const userId = locals.user.userId

	const db = useDb()

	const projects = await db
		.select({
			id: schema.projects.id,
			name: schema.projects.name,
			status: schema.projects.status,
			dueDate: schema.projects.dueDate,
		})
		.from(schema.projects)
		.where(
			and(
				eq(schema.projects.freelancerId, userId),
				ne(schema.projects.status, 'archived'),
			),
		)
		.orderBy(desc(schema.projects.createdAt))

	const stats = await db.execute<{
		active_projects: number
		completed_projects: number
		review_projects: number
		revenue_mtd: number
		total_invoices: number
		total_clients: number
	}>(sql`SELECT * FROM get_dashboard_stats(${userId})`)
	const s = stats.rows[0]

	const activity = await db.execute<{
		body: string
		created_at: string
		author_name: string
		project_id: string
		project_name: string
	}>(sql`SELECT * FROM get_activity_feed(${userId}, 5)`)

	const unread = await db.execute<{
		id: string
		body: string
		created_at: string
		author_name: string
		project_id: string
		project_name: string
	}>(sql`SELECT * FROM get_unread_comments(${userId})`)

	const activeFallback = projects.filter(
		(p) => p.status !== 'completed' && p.status !== 'archived',
	).length

	const onboarding = {
		hasProject: projects.length > 0,
		hasClient: (s?.total_clients ?? 0) > 0,
		hasInvoice: (s?.total_invoices ?? 0) > 0,
		hasProfile: !!locals.user.email,
	}

	return {
		projects,
		active: s?.active_projects ?? activeFallback,
		completed: s?.completed_projects ?? 0,
		pending: s?.review_projects ?? 0,
		revenueMTD: s?.revenue_mtd ?? 0,
		activity: activity.rows ?? [],
		unreadComments: unread.rows ?? [],
		onboarding,
		onboardingDone: Object.values(onboarding).every(Boolean),
	}
}

export const actions: Actions = {
	mark_read: async ({ locals }) => {
		if (!locals.user) error(401)
		const db = useDb()
		await db.execute(sql`SELECT mark_comments_read(${locals.user.userId})`)
	},
}
