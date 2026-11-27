import { error, fail, redirect } from '@sveltejs/kit'
import { isProjectStatus } from '#lib/domain/status.js'
import { DB_ERROR, ownerAction } from '#lib/server/action.js'
import { int, str } from '#lib/server/form.js'
import { requireUser } from '#lib/server/guard.js'
import {
	addComment,
	addMilestone,
	deleteProject,
	deleteProjectFile,
	handleUploadFileAction,
	inviteClientByEmail,
	logTime,
	removeProjectClient,
	saveProjectNote,
	setProjectStatus,
	toggleMilestone,
} from '#lib/server/project-actions.js'
import {
	getProjectClients,
	getProjectComments,
	getProjectFiles,
	getProjectForOwner,
	getProjectMilestones,
	getProjectNote,
	getProjectTimeEntries,
} from '#lib/server/projects.js'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = requireUser(locals)

	const project = await getProjectForOwner(params.id, user.userId)
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
	log_time: ownerAction(async ({ projectId, user, form }) => {
		const minutes = int(form, 'minutes')
		if (minutes <= 0) return fail(400, { error: 'Invalid minutes' })
		try {
			await logTime(
				projectId,
				user.userId,
				minutes,
				str(form, 'description') || null,
			)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	}),

	save_note: ownerAction(async ({ projectId, form }) => {
		try {
			await saveProjectNote(projectId, str(form, 'body'))
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	}),

	comment: ownerAction(async ({ projectId, user, form }) => {
		const body = str(form, 'body')
		if (!body) return fail(400, { error: 'Comment body is required' })
		try {
			await addComment(projectId, user.userId, body)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	}),

	toggle_milestone: ownerAction(async ({ projectId, form }) => {
		await toggleMilestone(
			projectId,
			str(form, 'id'),
			form.get('completed') === 'true',
		)
	}),

	add_milestone: ownerAction(async ({ projectId, form }) => {
		const name = str(form, 'name')
		if (!name) return fail(400, { error: 'Name is required' })
		try {
			await addMilestone(projectId, name)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	}),

	upload_file: ownerAction(({ projectId, user, form }) =>
		handleUploadFileAction(projectId, user.userId, form),
	),

	delete_file: ownerAction(async ({ projectId, form }) => {
		if (!(await deleteProjectFile(projectId, str(form, 'id'))))
			return fail(404, { error: 'File not found' })
	}),

	update_status: ownerAction(async ({ projectId, form }) => {
		const status = str(form, 'status')
		if (!isProjectStatus(status)) return fail(400, { error: 'Invalid status' })
		try {
			await setProjectStatus(projectId, status)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	}),

	delete_project: ownerAction(async ({ projectId }) => {
		try {
			await deleteProject(projectId)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
		redirect(303, '/dashboard/projects')
	}),

	remove_client: ownerAction(async ({ projectId, form }) => {
		try {
			await removeProjectClient(projectId, str(form, 'client_id'))
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	}),

	invite_client: ownerAction(async ({ projectId, form }) => {
		const email = str(form, 'email').toLowerCase()
		if (!(email && /^\S+@\S+\.\S+$/.test(email)))
			return fail(400, { error: 'A valid email is required' })
		try {
			const invite = await inviteClientByEmail(email, projectId)
			return { invited: true, email, tempPassword: invite.tempPassword ?? null }
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	}),
}
