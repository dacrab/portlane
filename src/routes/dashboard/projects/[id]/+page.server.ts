import { error, fail, redirect } from '@sveltejs/kit'
import { and, desc, eq, sql } from 'drizzle-orm'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { DB_ERROR, formFile, int, str } from '$lib/server/form'
import {
	getProjectComments,
	getProjectFiles,
	getProjectMilestones,
	inviteClientByEmail,
	uploadProjectFile,
} from '$lib/server/project'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) error(401, 'Unauthorized')
	const db = useDb()

	const [project] = await db
		.select()
		.from(schema.projects)
		.where(
			and(
				eq(schema.projects.id, params.id),
				eq(schema.projects.freelancerId, locals.user.userId),
			),
		)
		.limit(1)

	if (!project) error(404, 'Project not found')

	const [milestones, files, comments, clients, timeEntries, noteRows] =
		await Promise.all([
			getProjectMilestones(params.id),
			getProjectFiles(params.id),
			getProjectComments(params.id),
			db
				.select({ id: schema.users.id, name: schema.users.name })
				.from(schema.projectClients)
				.innerJoin(
					schema.users,
					eq(schema.users.id, schema.projectClients.clientId),
				)
				.where(eq(schema.projectClients.projectId, params.id)),
			db
				.select()
				.from(schema.timeEntries)
				.where(eq(schema.timeEntries.projectId, params.id))
				.orderBy(desc(schema.timeEntries.loggedAt)),
			db
				.select()
				.from(schema.projectNotes)
				.where(eq(schema.projectNotes.projectId, params.id))
				.limit(1),
		])

	return {
		project,
		milestones,
		files,
		comments,
		clients,
		timeEntries,
		note: noteRows[0]?.body ?? '',
	}
}

export const actions: Actions = {
	log_time: async ({ locals, params, request }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' })
		const form = await request.formData()
		const minutes = int(form, 'minutes')
		const description = str(form, 'description') || null
		if (!minutes || minutes <= 0) return fail(400, { error: 'Invalid minutes' })
		const db = useDb()
		try {
			await db.insert(schema.timeEntries).values({
				projectId: params.id,
				userId: locals.user.userId,
				minutes,
				description,
			})
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	save_note: async ({ locals, params, request }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' })
		const form = await request.formData()
		const body = str(form, 'body')
		const db = useDb()
		try {
			await db
				.insert(schema.projectNotes)
				.values({ projectId: params.id, body })
				.onConflictDoUpdate({
					target: schema.projectNotes.projectId,
					set: { body },
				})
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	comment: async ({ locals, params, request }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' })
		const form = await request.formData()
		const body = str(form, 'body')
		if (!body) return fail(400, { error: 'Comment body is required' })
		const db = useDb()
		try {
			await db.insert(schema.comments).values({
				projectId: params.id,
				authorId: locals.user.userId,
				body,
			})
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	toggle_milestone: async ({ locals, params, request }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' })
		const form = await request.formData()
		const id = str(form, 'id')
		const completed = form.get('completed') === 'true'
		const db = useDb()
		await db
			.update(schema.milestones)
			.set({ completed: !completed })
			.where(
				and(
					eq(schema.milestones.id, id),
					eq(schema.milestones.projectId, params.id),
					sql`${params.id} IN (SELECT id FROM project WHERE id = ${params.id} AND freelancer_id = ${locals.user.userId})`,
				),
			)
	},

	add_milestone: async ({ locals, params, request }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' })
		const form = await request.formData()
		const name = str(form, 'name')
		if (!name) return fail(400, { error: 'Name is required' })
		const db = useDb()
		await db.execute(sql`SELECT add_milestone(${params.id}, ${name})`)
	},

	upload_file: async ({ locals, params, request }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' })
		const form = await request.formData()
		const file = formFile(form, 'file')
		if (!file?.size) return fail(400, { error: 'No file provided' })
		try {
			await uploadProjectFile(params.id, locals.user.userId, file)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	delete_file: async ({ locals, request }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' })
		const form = await request.formData()
		const id = str(form, 'id')
		const db = useDb()

		const [file] = await db
			.select({
				storagePath: schema.files.storagePath,
				projectId: schema.files.projectId,
			})
			.from(schema.files)
			.where(eq(schema.files.id, id))
			.limit(1)

		if (!file) return fail(404, { error: 'File not found' })

		const [owner] = await db
			.select({ id: schema.projects.id })
			.from(schema.projects)
			.where(
				and(
					eq(schema.projects.id, file.projectId),
					eq(schema.projects.freelancerId, locals.user.userId),
				),
			)
			.limit(1)

		if (!owner) return fail(403, { error: 'Not your project' })

		try {
			const { del } = await import('@vercel/blob')
			await del(file.storagePath)
		} catch {}

		await db.delete(schema.files).where(eq(schema.files.id, id))
	},

	update_status: async ({ locals, params, request }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' })
		const form = await request.formData()
		const status = str(form, 'status')
		const db = useDb()
		try {
			await db
				.update(schema.projects)
				.set({ status })
				.where(
					and(
						eq(schema.projects.id, params.id),
						eq(schema.projects.freelancerId, locals.user.userId),
					),
				)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	delete_project: async ({ locals, params }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' })
		const db = useDb()
		try {
			await db
				.delete(schema.projects)
				.where(
					and(
						eq(schema.projects.id, params.id),
						eq(schema.projects.freelancerId, locals.user.userId),
					),
				)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
		redirect(303, '/dashboard/projects')
	},

	remove_client: async ({ locals, params, request }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' })
		const form = await request.formData()
		const client_id = str(form, 'client_id')
		const db = useDb()
		try {
			await db
				.delete(schema.projectClients)
				.where(
					and(
						eq(schema.projectClients.projectId, params.id),
						eq(schema.projectClients.clientId, client_id),
					),
				)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	invite_client: async ({ locals, params, request }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' })
		const form = await request.formData()
		const email = str(form, 'email').toLowerCase()
		if (!email) return fail(400, { error: 'Email is required' })

		const db = useDb()
		const [owner] = await db
			.select({ id: schema.projects.id })
			.from(schema.projects)
			.where(
				and(
					eq(schema.projects.id, params.id),
					eq(schema.projects.freelancerId, locals.user.userId),
				),
			)
			.limit(1)

		if (!owner) return fail(403, { error: 'Not your project' })

		try {
			await inviteClientByEmail(email, params.id)
		} catch (e) {
			return fail(400, { error: (e as Error).message })
		}
	},
}
