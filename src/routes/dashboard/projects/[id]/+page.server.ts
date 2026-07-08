import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getProjectMilestones, getProjectFiles, getProjectComments, addComment, uploadProjectFile, inviteClientByEmail } from '$lib/server/project';
import { str, int } from '$lib/server/form';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();
	if (!user) error(401);

	const [projectRes, milestonesRes, filesRes, commentsRes, clientsRes, timeEntriesRes, noteRes] = await Promise.all([
		locals.supabase.from('projects').select('*').eq('id', params.id).eq('freelancer_id', user.id).single(),
		getProjectMilestones(locals.supabase, params.id),
		getProjectFiles(locals.supabase, params.id),
		getProjectComments(locals.supabase, params.id),
		locals.supabase.from('project_clients').select('profiles(id, full_name)').eq('project_id', params.id),
		locals.supabase.from('time_entries').select('*').eq('project_id', params.id).order('logged_at', { ascending: false }),
		locals.supabase.from('project_notes').select('*').eq('project_id', params.id).maybeSingle(),
	]);

	const project = projectRes.data;
	if (!project) error(404, 'Project not found');

	return {
		project,
		milestones: milestonesRes.data ?? [],
		files: filesRes.data ?? [],
		comments: commentsRes.data ?? [],
		clients: (clientsRes.data ?? []).map(c => c.profiles).filter(Boolean),
		timeEntries: timeEntriesRes.data ?? [],
		note: noteRes.data?.body ?? '',
	};
};

export const actions: Actions = {
	log_time: async ({ locals, params, request }) => {
		const { user } = await locals.safeGetSession();
		if (!user) error(401);
		const form = await request.formData();
		const minutes = int(form, 'minutes');
		const description = str(form, 'description') || null;
		if (!minutes || minutes <= 0) return fail(400, { error: 'Invalid minutes' });
		await locals.supabase.from('time_entries').insert({
			project_id: params.id, user_id: user.id, minutes, description,
		});
	},

	save_note: async ({ locals, params, request }) => {
		const form = await request.formData();
		const body = str(form, 'body');
		await locals.supabase.from('project_notes').upsert({ project_id: params.id, body }, { onConflict: 'project_id' });
	},

	comment: async ({ locals, params, request }) => {
		const { user } = await locals.safeGetSession();
		if (!user) error(401);
		const form = await request.formData();
		const body = str(form, 'body');
		if (!body) return fail(400, { error: 'Comment body is required' });
		await addComment(locals.supabase, params.id, user.id, body);
	},

	toggle_milestone: async ({ locals, params, request }) => {
		const form = await request.formData();
		const id = str(form, 'id');
		const completed = form.get('completed') === 'true';
		await locals.supabase.from('milestones').update({ completed: !completed }).eq('id', id).eq('project_id', params.id);
	},

	add_milestone: async ({ locals, params, request }) => {
		const form = await request.formData();
		const name = str(form, 'name');
		if (!name) return fail(400, { error: 'Name is required' });
		await locals.supabase.rpc('add_milestone', { p_project_id: params.id, p_name: name });
	},

	upload_file: async ({ locals, params, request }) => {
		const { user } = await locals.safeGetSession();
		if (!user) error(401);
		const form = await request.formData();
		const file = form.get('file');
		if (!(file instanceof File) || !file.size) return fail(400, { error: 'No file provided' });
		try {
			await uploadProjectFile(locals.supabase, params.id, user.id, file);
		} catch (e) {
			error(500, (e as Error).message);
		}
	},

	delete_file: async ({ locals, request }) => {
		const form = await request.formData();
		const id = str(form, 'id');
		const { data: file } = await locals.supabase.from('files').select('storage_path').eq('id', id).single();
		if (file) await locals.supabase.storage.from('project-files').remove([file.storage_path]);
		await locals.supabase.from('files').delete().eq('id', id);
	},

	update_status: async ({ locals, params, request }) => {
		const form = await request.formData();
		const status = str(form, 'status');
		await locals.supabase.from('projects').update({ status }).eq('id', params.id);
	},

	delete_project: async ({ locals, params }) => {
		await locals.supabase.from('projects').delete().eq('id', params.id);
		redirect(303, '/dashboard/projects');
	},

	remove_client: async ({ locals, params, request }) => {
		const form = await request.formData();
		const client_id = str(form, 'client_id');
		await locals.supabase.from('project_clients').delete().eq('project_id', params.id).eq('client_id', client_id);
	},

	invite_client: async ({ locals, params, request }) => {
		const { session } = await locals.safeGetSession();
		if (!session) error(401);
		const form = await request.formData();
		const email = str(form, 'email').toLowerCase();
		if (!email) return fail(400, { error: 'Email is required' });

		const inviteErr = await inviteClientByEmail(session.access_token, email, params.id);
		if (inviteErr) return fail(400, { error: inviteErr.message });
	},
};
