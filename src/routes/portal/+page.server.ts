import { error, fail } from '@sveltejs/kit'
import { clientAction, DB_ERROR } from '#lib/server/action.js'
import { str } from '#lib/server/form.js'
import { requireUser } from '#lib/server/guard.js'
import { checkoutAction } from '#lib/server/invoice-actions.js'
import { getClientProjectInvoices } from '#lib/server/invoices.js'
import {
	addComment,
	approveProject,
	handleUploadFileAction,
	requestRevision,
} from '#lib/server/project-actions.js'
import {
	getProjectComments,
	getProjectFiles,
	getProjectMilestones,
	getProjectsForClient,
	getProjectWithFreelancer,
	isProjectClient,
} from '#lib/server/projects.js'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = requireUser(locals)
	const projectId = url.searchParams.get('project')

	if (!projectId) {
		return {
			project: null,
			projects: await getProjectsForClient(user.userId),
			milestones: [],
			files: [],
			comments: [],
			invoices: [],
		}
	}

	if (!(await isProjectClient(projectId, user.userId))) error(403, 'Forbidden')

	const [project, milestones, files, comments, invoices] = await Promise.all([
		getProjectWithFreelancer(projectId),
		getProjectMilestones(projectId),
		getProjectFiles(projectId),
		getProjectComments(projectId),
		getClientProjectInvoices(projectId, user.userId),
	])

	if (!project) error(404, 'Project not found')

	return { project, projects: [], milestones, files, comments, invoices }
}

export const actions: Actions = {
	comment: clientAction(async ({ projectId, user, form }) => {
		const body = str(form, 'body')
		if (!body) return fail(400, { error: 'Message body is required' })
		try {
			await addComment(projectId, user.userId, body)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	}),

	approve: clientAction(async ({ projectId, user, form }) => {
		await approveProject(projectId, user.userId, str(form, 'note'))
	}),

	request_revision: clientAction(async ({ projectId, user, form }) => {
		await requestRevision(projectId, user.userId, str(form, 'note'))
	}),

	upload_file: clientAction(({ projectId, user, form }) =>
		handleUploadFileAction(projectId, user.userId, form),
	),

	checkout: checkoutAction,
}
