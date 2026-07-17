import type { SupabaseClient } from '@supabase/supabase-js'
import { error, fail, redirect } from '@sveltejs/kit'
import type { Database } from '$lib/database.types'
import { DB_ERROR, formFile, int, str } from '$lib/server/form'
import {
	addComment,
	getProjectComments,
	getProjectFiles,
	getProjectMilestones,
	inviteClientByEmail,
	uploadProjectFile,
} from '$lib/server/project'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession()
	if (!user) error(401, 'Unauthorized')

	const [
		projectRes,
		milestonesRes,
		filesRes,
		commentsRes,
		clientsRes,
		timeEntriesRes,
		noteRes,
	] = await Promise.all([
		locals.supabase
			.from('projects')
			.select('*')
			.eq('id', params.id)
			.eq('freelancer_id', user.id)
			.single(),
		getProjectMilestones(locals.supabase, params.id),
		getProjectFiles(locals.supabase, params.id),
		getProjectComments(locals.supabase, params.id),
		locals.supabase
			.from('project_clients')
			.select('profiles(id, full_name)')
			.eq('project_id', params.id),
		locals.supabase
			.from('time_entries')
			.select('*')
			.eq('project_id', params.id)
			.order('logged_at', { ascending: false }),
		locals.supabase
			.from('project_notes')
			.select('*')
			.eq('project_id', params.id)
			.maybeSingle(),
	])

	if (projectRes.error) error(500, DB_ERROR)
	if (milestonesRes.error) error(500, DB_ERROR)
	if (filesRes.error) error(500, DB_ERROR)
	if (commentsRes.error) error(500, DB_ERROR)
	if (clientsRes.error) error(500, DB_ERROR)
	if (timeEntriesRes.error) error(500, DB_ERROR)
	if (noteRes.error) error(500, DB_ERROR)

	const project = projectRes.data
	if (!project) error(404, 'Project not found')

	return {
		project,
		milestones: milestonesRes.data ?? [],
		files: filesRes.data ?? [],
		comments: commentsRes.data ?? [],
		clients: (clientsRes.data ?? []).map((c) => c.profiles).filter(Boolean),
		timeEntries: timeEntriesRes.data ?? [],
		note: noteRes.data?.body ?? '',
	}
}

async function requireProjectOwnership(
	supabase: SupabaseClient<Database>,
	userId: string,
	projectId: string,
) {
	const { data: project } = await supabase
		.from('projects')
		.select('id')
		.eq('id', projectId)
		.eq('freelancer_id', userId)
		.maybeSingle()
	if (!project) return fail(403, { error: 'Not your project' })
	return null
}

export const actions: Actions = {
	log_time: async ({ locals, params, request }) => {
		const { user } = await locals.safeGetSession()
		if (!user) return fail(401, { error: 'Not authenticated' })
		const form = await request.formData()
		const minutes = int(form, 'minutes')
		const description = str(form, 'description') || null
		if (!minutes || minutes <= 0) return fail(400, { error: 'Invalid minutes' })
		const { error: e } = await locals.supabase.from('time_entries').insert({
			project_id: params.id,
			user_id: user.id,
			minutes,
			description,
		})
		if (e) return fail(500, { error: DB_ERROR })
	},

	save_note: async ({ locals, params, request }) => {
		const { user } = await locals.safeGetSession()
		if (!user) return fail(401, { error: 'Not authenticated' })
		const form = await request.formData()
		const body = str(form, 'body')
		const denied = await requireProjectOwnership(
			locals.supabase,
			user.id,
			params.id,
		)
		if (denied) return denied
		const { error: e } = await locals.supabase
			.from('project_notes')
			.upsert({ project_id: params.id, body }, { onConflict: 'project_id' })
		if (e) return fail(500, { error: DB_ERROR })
	},

	comment: async ({ locals, params, request }) => {
		const { user } = await locals.safeGetSession()
		if (!user) return fail(401, { error: 'Not authenticated' })
		const form = await request.formData()
		const body = str(form, 'body')
		if (!body) return fail(400, { error: 'Comment body is required' })
		await addComment(locals.supabase, params.id, user.id, body)
	},

	toggle_milestone: async ({ locals, params, request }) => {
		const { user } = await locals.safeGetSession()
		if (!user) return fail(401, { error: 'Not authenticated' })
		const form = await request.formData()
		const id = str(form, 'id')
		const completed = form.get('completed') === 'true'
		const denied = await requireProjectOwnership(
			locals.supabase,
			user.id,
			params.id,
		)
		if (denied) return denied
		await locals.supabase
			.from('milestones')
			.update({ completed: !completed })
			.eq('id', id)
			.eq('project_id', params.id)
	},

	add_milestone: async ({ locals, params, request }) => {
		const { user } = await locals.safeGetSession()
		if (!user) return fail(401, { error: 'Not authenticated' })
		const form = await request.formData()
		const name = str(form, 'name')
		if (!name) return fail(400, { error: 'Name is required' })
		const denied = await requireProjectOwnership(
			locals.supabase,
			user.id,
			params.id,
		)
		if (denied) return denied
		await locals.supabase.rpc('add_milestone', {
			p_project_id: params.id,
			p_name: name,
		})
	},

	upload_file: async ({ locals, params, request }) => {
		const { user } = await locals.safeGetSession()
		if (!user) return fail(401, { error: 'Not authenticated' })
		const form = await request.formData()
		const file = formFile(form, 'file')
		if (!file?.size) return fail(400, { error: 'No file provided' })
		try {
			await uploadProjectFile(locals.supabase, params.id, user.id, file)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	delete_file: async ({ locals, request }) => {
		const { user } = await locals.safeGetSession()
		if (!user) return fail(401, { error: 'Not authenticated' })
		const form = await request.formData()
		const id = str(form, 'id')
		// Only allow deleting files that belong to a project owned by the caller.
		const { data: file } = await locals.supabase
			.from('files')
			.select('storage_path, project_id')
			.eq('id', id)
			.maybeSingle()
		if (!file) return fail(404, { error: 'File not found' })
		const { data: owner } = await locals.supabase
			.from('projects')
			.select('id')
			.eq('id', file.project_id)
			.eq('freelancer_id', user.id)
			.maybeSingle()
		if (!owner) return fail(403, { error: 'Not your project' })
		await locals.supabase.storage
			.from('project-files')
			.remove([file.storage_path])
		await locals.supabase.from('files').delete().eq('id', id)
	},

	update_status: async ({ locals, params, request }) => {
		const { user } = await locals.safeGetSession()
		if (!user) return fail(401, { error: 'Not authenticated' })
		const form = await request.formData()
		const status = str(form, 'status')
		// Filter by freelancer_id so updates don't apply silently.
		const { error: e } = await locals.supabase
			.from('projects')
			.update({ status })
			.eq('id', params.id)
			.eq('freelancer_id', user.id)
		if (e) return fail(500, { error: DB_ERROR })
	},

	delete_project: async ({ locals, params }) => {
		const { user } = await locals.safeGetSession()
		if (!user) return fail(401, { error: 'Not authenticated' })
		const { error: e } = await locals.supabase
			.from('projects')
			.delete()
			.eq('id', params.id)
			.eq('freelancer_id', user.id)
		if (e) return fail(500, { error: DB_ERROR })
		redirect(303, '/dashboard/projects')
	},

	remove_client: async ({ locals, params, request }) => {
		const { user } = await locals.safeGetSession()
		if (!user) return fail(401, { error: 'Not authenticated' })
		const form = await request.formData()
		const client_id = str(form, 'client_id')
		const denied = await requireProjectOwnership(
			locals.supabase,
			user.id,
			params.id,
		)
		if (denied) return denied
		const { error: e } = await locals.supabase
			.from('project_clients')
			.delete()
			.eq('project_id', params.id)
			.eq('client_id', client_id)
		if (e) return fail(500, { error: DB_ERROR })
	},

	invite_client: async ({ locals, params, request }) => {
		const { session, user } = await locals.safeGetSession()
		if (!user) return fail(401, { error: 'Not authenticated' })
		if (!session) return fail(401, { error: 'Not authenticated' })
		const form = await request.formData()
		const email = str(form, 'email').toLowerCase()
		if (!email) return fail(400, { error: 'Email is required' })
		const denied = await requireProjectOwnership(
			locals.supabase,
			user.id,
			params.id,
		)
		if (denied) return denied

		const inviteErr = await inviteClientByEmail(
			session.access_token,
			email,
			params.id,
		)
		if (inviteErr) return fail(400, { error: inviteErr.message })
	},
}
