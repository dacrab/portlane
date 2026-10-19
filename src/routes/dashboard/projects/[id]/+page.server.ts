import { error, fail, redirect } from '@sveltejs/kit'
import { isProjectStatus } from '#lib/fmt.js'
import { DB_ERROR, int, str } from '#lib/server/form.js'
import { requireOwner } from '#lib/server/guard.js'
import {
	addComment,
	addMilestone,
	deleteProject,
	deleteProjectFile,
	getProjectClients,
	getProjectComments,
	getProjectFiles,
	getProjectForOwner,
	getProjectMilestones,
	getProjectNote,
	getProjectTimeEntries,
	handleUploadFileAction,
	inviteClientByEmail,
	logTime,
	removeProjectClient,
	saveProjectNote,
	setProjectStatus,
	toggleMilestone,
} from '#lib/server/projects.js'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) error(401, 'Unauthorized')

	const project = await getProjectForOwner(params.id, locals.user.userId)
	if (!project) error(404, 'Project not found')

	const [milestones, files, comments, clients, timeEntries, note] =
		await Promise.all([
			getProjectMilestones(params.id),
			getProjectFiles(params.id),
			getProjectComments(params.id),
			getProjectClients(params.id),
			getProjectTimeEntries(params.id),
			getProjectNote(params.id),
		])

	return { project, milestones, files, comments, clients, timeEntries, note }
}

export const actions: Actions = {
	log_time: async ({ locals, params, request }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		const form = await request.formData()
		const minutes = int(form, 'minutes')
		const description = str(form, 'description') || null
		if (!minutes || minutes <= 0) return fail(400, { error: 'Invalid minutes' })
		try {
			await logTime(guard.projectId, guard.userId, minutes, description)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	save_note: async ({ locals, params, request }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		const body = str(await request.formData(), 'body')
		try {
			await saveProjectNote(guard.projectId, body)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	comment: async ({ locals, params, request }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		const body = str(await request.formData(), 'body')
		if (!body) return fail(400, { error: 'Comment body is required' })
		try {
			await addComment(guard.projectId, guard.userId, body)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	toggle_milestone: async ({ locals, params, request }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		const form = await request.formData()
		await toggleMilestone(
			guard.projectId,
			str(form, 'id'),
			form.get('completed') === 'true',
		)
	},

	add_milestone: async ({ locals, params, request }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		const name = str(await request.formData(), 'name')
		if (!name) return fail(400, { error: 'Name is required' })
		try {
			await addMilestone(guard.projectId, name)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	upload_file: async ({ locals, params, request }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		return handleUploadFileAction(
			guard.projectId,
			guard.userId,
			await request.formData(),
		)
	},

	delete_file: async ({ locals, params, request }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		const id = str(await request.formData(), 'id')
		if (!(await deleteProjectFile(guard.projectId, id)))
			return fail(404, { error: 'File not found' })
	},

	update_status: async ({ locals, params, request }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		const status = str(await request.formData(), 'status')
		if (!isProjectStatus(status)) return fail(400, { error: 'Invalid status' })
		try {
			await setProjectStatus(guard.projectId, status)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	delete_project: async ({ locals, params }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		try {
			await deleteProject(guard.projectId)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
		redirect(303, '/dashboard/projects')
	},

	remove_client: async ({ locals, params, request }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		const clientId = str(await request.formData(), 'client_id')
		try {
			await removeProjectClient(guard.projectId, clientId)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	invite_client: async ({ locals, params, request }) => {
		const guard = await requireOwner(locals, params.id)
		if (guard.err) return guard.err
		const email = str(await request.formData(), 'email').toLowerCase()
		if (!(email && /^\S+@\S+\.\S+$/.test(email)))
			return fail(400, { error: 'A valid email is required' })
		try {
			await inviteClientByEmail(email, guard.projectId)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},
}
