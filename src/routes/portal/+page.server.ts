import { error, fail, redirect } from '@sveltejs/kit'
import type { Database } from '$lib/database.types'
import { str } from '$lib/server/form'
import {
	addComment,
	getProjectComments,
	getProjectFiles,
	getProjectMilestones,
	uploadProjectFile,
} from '$lib/server/project'
import { createCheckoutSessionViaEdge } from '$lib/server/stripe'
import type { Actions, PageServerLoad } from './$types'

type ProjectItem = Database['public']['Tables']['projects']['Row'] & {
	profiles: Pick<
		Database['public']['Tables']['profiles']['Row'],
		'full_name'
	> | null
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const { user } = await locals.safeGetSession()
	if (!user) redirect(303, '/login')

	const projectId = url.searchParams.get('project')

	if (!projectId) {
		const { data: rows } = await locals.supabase
			.from('project_clients')
			.select(
				'projects(id, name, status, due_date, profiles!projects_freelancer_id_fkey(full_name))',
			)
			.eq('client_id', user.id)

		const projects: ProjectItem[] = (rows ?? []).flatMap((r) => {
			const p = (r as { projects: ProjectItem | null }).projects
			return p ? [p] : []
		})
		return {
			project: null,
			projects,
			milestones: [],
			files: [],
			comments: [],
			invoices: [],
			user,
		}
	}

	const { data: membership } = await locals.supabase
		.from('project_clients')
		.select('project_id')
		.eq('project_id', projectId)
		.eq('client_id', user.id)
		.maybeSingle()
	if (!membership) error(403, 'Forbidden')

	const [projectRes, milestonesRes, filesRes, commentsRes, invoicesRes] =
		await Promise.all([
			locals.supabase
				.from('projects')
				.select('*, profiles!projects_freelancer_id_fkey(full_name)')
				.eq('id', projectId)
				.single(),
			getProjectMilestones(locals.supabase, projectId),
			getProjectFiles(locals.supabase, projectId),
			getProjectComments(locals.supabase, projectId),
			locals.supabase
				.from('invoices')
				.select('*')
				.eq('project_id', projectId)
				.eq('client_id', user.id)
				.order('created_at', { ascending: false }),
		])

	const project = projectRes.data
	if (!project) error(404, 'Project not found')

	return {
		project,
		projects: [],
		milestones: milestonesRes.data ?? [],
		files: filesRes.data ?? [],
		comments: commentsRes.data ?? [],
		invoices: invoicesRes.data ?? [],
		user,
	}
}

/** Guards a client portal action: requires an authenticated client with a
 * selected project, returning `{ user, projectId }` or throwing (401/400). */
async function requireClientProject({
	locals,
	url,
}: {
	locals: App.Locals
	url: URL
}) {
	const { user } = await locals.safeGetSession()
	if (!user) error(401)
	const projectId = url.searchParams.get('project')
	if (!projectId) error(400, 'Missing project')
	return { user, projectId }
}

export const actions: Actions = {
	comment: async ({ locals, url, request }) => {
		const { user, projectId } = await requireClientProject({ locals, url })
		const form = await request.formData()
		const body = str(form, 'body')
		if (!body) return
		await addComment(locals.supabase, projectId, user.id, body)
	},

	approve: async ({ locals, url, request }) => {
		const { projectId } = await requireClientProject({ locals, url })
		const note = str(await request.formData(), 'note') || null
		await locals.supabase.rpc('approve_project', {
			p_project_id: projectId,
			p_note: note || undefined,
		})
	},

	request_revision: async ({ locals, url, request }) => {
		const { projectId } = await requireClientProject({ locals, url })
		const note = str(await request.formData(), 'note') || null
		await locals.supabase.rpc('request_revision', {
			p_project_id: projectId,
			p_note: note || undefined,
		})
	},

	upload_file: async ({ locals, url, request }) => {
		const { user, projectId } = await requireClientProject({ locals, url })
		const form = await request.formData()
		const file = form.get('file')
		if (!(file instanceof File) || !file.size) return
		try {
			await uploadProjectFile(locals.supabase, projectId, user.id, file)
		} catch (e) {
			error(500, e instanceof Error ? e.message : 'Upload failed')
		}
	},

	checkout: async ({ locals, request, url: reqUrl }) => {
		const { session, user } = await locals.safeGetSession()
		if (!user) error(401)
		if (!session) error(401)

		const form = await request.formData()
		const invoiceId = str(form, 'invoiceId')
		if (!invoiceId) return fail(400, { missing: true })

		const result = await createCheckoutSessionViaEdge(
			invoiceId,
			session.access_token,
			reqUrl.origin,
		)
		if ('error' in result) return fail(result.status, { error: result.error })
		return { url: result.url }
	},
}
