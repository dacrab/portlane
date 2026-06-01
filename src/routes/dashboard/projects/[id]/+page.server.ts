import { error, redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SECRET_KEY } from '$env/static/private';
import type { PageServerLoad, Actions } from './$types';
import type { Database } from '$lib/database.types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();

	const [{ data: project }, { data: milestones }, { data: files }, { data: comments }, { data: clients }, { data: timeEntries }, { data: note }] = await Promise.all([
		locals.supabase
			.from('projects')
			.select('*')
			.eq('id', params.id)
			.eq('freelancer_id', user!.id)
			.single(),
		locals.supabase
			.from('milestones')
			.select('*')
			.eq('project_id', params.id)
			.order('position'),
		locals.supabase
			.from('files')
			.select('*')
			.eq('project_id', params.id)
			.order('created_at', { ascending: false }),
		locals.supabase
			.from('comments')
			.select('*, profiles(full_name)')
			.eq('project_id', params.id)
			.order('created_at'),
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
	]);

	if (!project) error(404, 'Project not found');

	return {
		project,
		milestones: milestones ?? [],
		files: files ?? [],
		comments: comments ?? [],
		clients: clients?.map(c => c.profiles).filter(Boolean) ?? [],
		timeEntries: timeEntries ?? [],
		note: note?.body ?? '',
	};
};

export const actions: Actions = {
	log_time: async ({ locals, params, request }) => {
		const { user } = await locals.safeGetSession();
		const form = await request.formData();
		const minutes = parseInt(form.get('minutes') as string);
		const description = (form.get('description') as string | null)?.trim() || null;
		if (!minutes || minutes <= 0) return;
		await locals.supabase.from('time_entries').insert({
			project_id: params.id,
			user_id: user!.id,
			minutes,
			description,
		});
	},

	save_note: async ({ locals, params, request }) => {
		const form = await request.formData();
		const body = (form.get('body') as string).trim();
		await locals.supabase
			.from('project_notes')
			.upsert({ project_id: params.id, body }, { onConflict: 'project_id' });
	},

	comment: async ({ locals, params, request }) => {
		const { user } = await locals.safeGetSession();
		const form = await request.formData();
		const body = (form.get('body') as string).trim();
		if (!body) return;
		await locals.supabase.from('comments').insert({ project_id: params.id, author_id: user!.id, body });
	},

	toggle_milestone: async ({ locals, request }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		const completed = form.get('completed') === 'true';
		await locals.supabase.from('milestones').update({ completed: !completed }).eq('id', id);
	},

	add_milestone: async ({ locals, params, request }) => {
		const form = await request.formData();
		const name = (form.get('name') as string).trim();
		if (!name) return;
		const { count } = await locals.supabase
			.from('milestones')
			.select('*', { count: 'exact', head: true })
			.eq('project_id', params.id);
		await locals.supabase.from('milestones').insert({
			project_id: params.id,
			name,
			position: count ?? 0,
		});
	},

	upload_file: async ({ locals, params, request }) => {
		const { user } = await locals.safeGetSession();
		const form = await request.formData();
		const file = form.get('file') as File;
		if (!file || !file.size) return;

		const path = `${params.id}/${crypto.randomUUID()}-${file.name}`;
		const { error: uploadErr } = await locals.supabase.storage
			.from('project-files')
			.upload(path, file);
		if (uploadErr) error(500, uploadErr.message);

		await locals.supabase.from('files').insert({
			project_id: params.id,
			uploaded_by: user!.id,
			name: file.name,
			storage_path: path,
			size_bytes: file.size,
		});
	},

	delete_file: async ({ locals, request }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		const { data: file } = await locals.supabase.from('files').select('storage_path').eq('id', id).single();
		if (file) await locals.supabase.storage.from('project-files').remove([file.storage_path]);
		await locals.supabase.from('files').delete().eq('id', id);
	},

	update_status: async ({ locals, params, request }) => {
		const form = await request.formData();
		const status = form.get('status') as string;
		await locals.supabase.from('projects').update({ status }).eq('id', params.id);
	},

	delete_project: async ({ locals, params }) => {
		await locals.supabase.from('projects').delete().eq('id', params.id);
		redirect(303, '/dashboard/projects');
	},

	remove_client: async ({ locals, params, request }) => {
		const form = await request.formData();
		const client_id = form.get('client_id') as string;
		await locals.supabase.from('project_clients').delete()
			.eq('project_id', params.id)
			.eq('client_id', client_id);
	},

	invite_client: async ({ locals, params, request, url }) => {
		const form = await request.formData();
		const email = (form.get('email') as string).trim().toLowerCase();
		if (!email) return;

		const admin = createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
			auth: { autoRefreshToken: false, persistSession: false },
		});

		const redirectTo = `${url.origin}/auth/callback?next=/portal?project=${params.id}`;
		await admin.auth.admin.inviteUserByEmail(email, {
			data: { role: 'client' },
			redirectTo,
		});
	},
};
