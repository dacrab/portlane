import { error, fail, redirect } from '@sveltejs/kit'
import { desc, eq, sql } from 'drizzle-orm'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { DB_ERROR, str } from '$lib/server/form'
import { inviteClientByEmail } from '$lib/server/project'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) error(401)
	const db = useDb()

	const projects = await db
		.select({
			id: schema.projects.id,
			freelancerId: schema.projects.freelancerId,
			name: schema.projects.name,
			description: schema.projects.description,
			status: schema.projects.status,
			dueDate: schema.projects.dueDate,
			createdAt: schema.projects.createdAt,
			completedMilestones: sql<number>`(SELECT COUNT(*) FROM milestone WHERE project_id = ${schema.projects.id} AND completed = true)::int`,
			totalMilestones: sql<number>`(SELECT COUNT(*) FROM milestone WHERE project_id = ${schema.projects.id})::int`,
			clientCount: sql<number>`(SELECT COUNT(*) FROM project_client WHERE project_id = ${schema.projects.id})::int`,
		})
		.from(schema.projects)
		.where(eq(schema.projects.freelancerId, locals.user.userId))
		.orderBy(desc(schema.projects.createdAt))

	return { projects }
}

export const actions: Actions = {
	create: async ({ locals, request }) => {
		if (!locals.user) error(401)
		const form = await request.formData()
		const name = str(form, 'name')
		const description = str(form, 'description') || null
		const due_date = str(form, 'due_date') || null
		const status = str(form, 'status', 'planning')
		const client_email = str(form, 'client_email').toLowerCase() || null

		if (!name) return fail(400, { error: 'Name is required' })

		const db = useDb()
		const [project] = await db
			.insert(schema.projects)
			.values({
				name,
				description,
				dueDate: due_date,
				status,
				freelancerId: locals.user.userId,
			})
			.returning({ id: schema.projects.id })

		if (!project) return fail(500, { error: DB_ERROR })

		if (client_email) {
			try {
				await inviteClientByEmail(client_email, project.id)
			} catch (e) {
				return fail(200, { error: (e as Error).message })
			}
		}

		redirect(303, `/dashboard/projects/${project.id}`)
	},
}
