import { error, fail, redirect } from '@sveltejs/kit'
import { DB_ERROR, str } from '#lib/server/form.js'
import { requireClientFromUrl } from '#lib/server/guard.js'
import {
	checkoutAction,
	getClientProjectInvoices,
} from '#lib/server/invoices.js'
import {
	addComment,
	approveProject,
	getProjectComments,
	getProjectFiles,
	getProjectMilestones,
	getProjectsForClient,
	getProjectWithFreelancer,
	handleUploadFileAction,
	isProjectClient,
	requestRevision,
} from '#lib/server/projects.js'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(303, '/login')
	const userId = locals.user.userId
	const projectId = url.searchParams.get('project')

	if (!projectId) {
		return {
			project: null,
			projects: await getProjectsForClient(userId),
			milestones: [],
			files: [],
			comments: [],
			invoices: [],
			user: locals.user,
		}
	}

	if (!(await isProjectClient(projectId, userId))) error(403, 'Forbidden')

	const [project, milestones, files, comments, invoices] = await Promise.all([
		getProjectWithFreelancer(projectId),
		getProjectMilestones(projectId),
		getProjectFiles(projectId),
		getProjectComments(projectId),
		getClientProjectInvoices(projectId, userId),
	])

	if (!project) error(404, 'Project not found')

	return {
		project,
		projects: [],
		milestones,
		files,
		comments,
		invoices,
		user: locals.user,
	}
}

export const actions: Actions = {
	comment: async ({ locals, url, request }) => {
		const guard = await requireClientFromUrl(locals, url)
		if (guard.err) return guard.err
		const body = str(await request.formData(), 'body')
		if (!body) return fail(400, { error: 'Message body is required' })
		try {
			await addComment(guard.projectId, guard.userId, body)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	approve: async ({ locals, url, request }) => {
		const guard = await requireClientFromUrl(locals, url)
		if (guard.err) return guard.err
		const note = str(await request.formData(), 'note')
		await approveProject(guard.projectId, guard.userId, note)
	},

	request_revision: async ({ locals, url, request }) => {
		const guard = await requireClientFromUrl(locals, url)
		if (guard.err) return guard.err
		const note = str(await request.formData(), 'note')
		await requestRevision(guard.projectId, guard.userId, note)
	},

	upload_file: async ({ locals, url, request }) => {
		const guard = await requireClientFromUrl(locals, url)
		if (guard.err) return guard.err
		return handleUploadFileAction(
			guard.projectId,
			guard.userId,
			await request.formData(),
		)
	},

	checkout: checkoutAction,
}
