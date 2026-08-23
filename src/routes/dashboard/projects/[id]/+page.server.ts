import { error, fail, redirect } from '@sveltejs/kit'
import { del } from '@vercel/blob'
import { and, desc, eq, sql } from 'drizzle-orm'
import { PROJECT_STATUS_ITEMS } from '$lib/fmt'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { DB_ERROR, formFile, int, str } from '$lib/server/form'
import { requireOwner } from '$lib/server/guard'
import {
	FileUploadError,
	getProjectComments,
	getProjectFiles,
	getProjectMilestones,
	inviteClientByEmail,
	uploadProjectFile,
} from '$lib/server/project'
import type { Actions, PageServerLoad } from './$types'

const validStatuses: string[] = PROJECT_STATUS_ITEMS.map((s) => s.value)

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
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		const form = await request.formData()
		const minutes = int(form, 'minutes')
		const description = str(form, 'description') || null
		if (!minutes || minutes <= 0) return fail(400, { error: 'Invalid minutes' })
		const db = useDb()
		try {
			await db.insert(schema.timeEntries).values({
				projectId: guard.projectId,
				userId: guard.userId,
				minutes,
				description,
			})
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	save_note: async ({ locals, params, request }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		const form = await request.formData()
		const body = str(form, 'body')
		const db = useDb()
		try {
			await db
				.insert(schema.projectNotes)
				.values({ projectId: guard.projectId, body })
				.onConflictDoUpdate({
					target: schema.projectNotes.projectId,
					set: { body },
				})
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	comment: async ({ locals, params, request }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		const form = await request.formData()
		const body = str(form, 'body')
		if (!body) return fail(400, { error: 'Comment body is required' })
		const db = useDb()
		try {
			await db.insert(schema.comments).values({
				projectId: guard.projectId,
				authorId: guard.userId,
				body,
			})
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	toggle_milestone: async ({ locals, params, request }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
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
					eq(schema.milestones.projectId, guard.projectId),
				),
			)
	},

	add_milestone: async ({ locals, params, request }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		const form = await request.formData()
		const name = str(form, 'name')
		if (!name) return fail(400, { error: 'Name is required' })
		const db = useDb()
		try {
			await db.execute(sql`SELECT add_milestone(${guard.projectId}, ${name})`)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	upload_file: async ({ locals, params, request }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		const form = await request.formData()
		const file = formFile(form, 'file')
		if (!file?.size) return fail(400, { error: 'No file provided' })
		try {
			await uploadProjectFile(guard.projectId, guard.userId, file)
		} catch (e) {
			if (e instanceof FileUploadError) {
				const status = e.code === 'too_large' ? 413 : 415
				return fail(status, { error: e.message })
			}
			return fail(500, { error: DB_ERROR })
		}
	},

	delete_file: async ({ locals, params, request }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		const form = await request.formData()
		const id = str(form, 'id')
		const db = useDb()

		const [file] = await db
			.select({ storagePath: schema.files.storagePath })
			.from(schema.files)
			.where(
				and(
					eq(schema.files.id, id),
					eq(schema.files.projectId, guard.projectId),
				),
			)
			.limit(1)

		if (!file) return fail(404, { error: 'File not found' })

		try {
			await del(file.storagePath)
		} catch {
			// Blob deletion is best-effort; the row is removed regardless.
		}

		await db.delete(schema.files).where(eq(schema.files.id, id))
	},

	update_status: async ({ locals, params, request }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		const form = await request.formData()
		const status = str(form, 'status')
		if (!validStatuses.includes(status))
			return fail(400, { error: 'Invalid status' })
		const db = useDb()
		try {
			await db
				.update(schema.projects)
				.set({ status })
				.where(eq(schema.projects.id, guard.projectId))
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	delete_project: async ({ locals, params }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		const db = useDb()
		try {
			await db
				.delete(schema.projects)
				.where(eq(schema.projects.id, guard.projectId))
		} catch {
			return fail(500, { error: DB_ERROR })
		}
		redirect(303, '/dashboard/projects')
	},

	remove_client: async ({ locals, params, request }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		const form = await request.formData()
		const client_id = str(form, 'client_id')
		const db = useDb()
		try {
			await db
				.delete(schema.projectClients)
				.where(
					and(
						eq(schema.projectClients.projectId, guard.projectId),
						eq(schema.projectClients.clientId, client_id),
					),
				)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	invite_client: async ({ locals, params, request }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		const form = await request.formData()
		const email = str(form, 'email').toLowerCase()
		if (!(email && /^\S+@\S+\.\S+$/.test(email)))
			return fail(400, { error: 'A valid email is required' })

		try {
			await inviteClientByEmail(email, guard.projectId)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},
}
