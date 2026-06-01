import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session) redirect(303, '/login');

	const projectId = url.searchParams.get('project');

	// No project selected — return list of client's projects
	if (!projectId) {
		const { data: rows } = await locals.supabase
			.from('project_clients')
			.select('projects(id, name, status, due_date, profiles!projects_freelancer_id_fkey(full_name))')
			.eq('client_id', user!.id);

		const projects = (rows ?? []).map((r: any) => r.projects).filter(Boolean);
		if (projects.length === 1) redirect(303, `/portal?project=${projects[0].id}`);
		return { project: null, projects, milestones: [], files: [], comments: [], invoices: [], user };
	}

	const [{ data: project }, { data: milestones }, { data: files }, { data: comments }, { data: invoices }] = await Promise.all([
		locals.supabase
			.from('projects')
			.select('*, profiles!projects_freelancer_id_fkey(full_name)')
			.eq('id', projectId)
			.single(),
		locals.supabase
			.from('milestones')
			.select('*')
			.eq('project_id', projectId)
			.order('position'),
		locals.supabase
			.from('files')
			.select('*')
			.eq('project_id', projectId)
			.order('created_at', { ascending: false }),
		locals.supabase
			.from('comments')
			.select('*, profiles(full_name)')
			.eq('project_id', projectId)
			.order('created_at'),
		locals.supabase
			.from('invoices')
			.select('*')
			.eq('project_id', projectId)
			.eq('client_id', user!.id)
			.order('created_at', { ascending: false }),
	]);

	if (!project) error(404, 'Project not found');

	return { project, projects: [], milestones: milestones ?? [], files: files ?? [], comments: comments ?? [], invoices: invoices ?? [], user };
};

export const actions: Actions = {
	comment: async ({ locals, url, request }) => {
		const { user } = await locals.safeGetSession();
		if (!user) error(401);
		const projectId = url.searchParams.get('project')!;
		const form = await request.formData();
		const body = (form.get('body') as string).trim();
		if (!body) return;
		await locals.supabase.from('comments').insert({ project_id: projectId, author_id: user.id, body });
	},

	approve: async ({ locals, url, request }) => {
		const { user } = await locals.safeGetSession();
		if (!user) error(401);
		const projectId = url.searchParams.get('project')!;
		const form = await request.formData();
		const note = (form.get('note') as string | null)?.trim();
		const body = note ? `✅ Approved — ${note}` : '✅ Approved';
		await locals.supabase.from('comments').insert({ project_id: projectId, author_id: user.id, body });
		await locals.supabase.from('projects').update({ status: 'completed' }).eq('id', projectId);
	},

	request_revision: async ({ locals, url, request }) => {
		const { user } = await locals.safeGetSession();
		if (!user) error(401);
		const projectId = url.searchParams.get('project')!;
		const form = await request.formData();
		const note = (form.get('note') as string | null)?.trim();
		const body = note ? `🔄 Revision requested — ${note}` : '🔄 Revision requested';
		await locals.supabase.from('comments').insert({ project_id: projectId, author_id: user.id, body });
		await locals.supabase.from('projects').update({ status: 'review' }).eq('id', projectId);
	},
};
