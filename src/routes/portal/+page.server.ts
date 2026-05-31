import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session) redirect(303, '/login');

	const projectId = url.searchParams.get('project');
	if (!projectId) error(400, 'Missing project');

	const [{ data: project }, { data: milestones }, { data: files }, { data: comments }] = await Promise.all([
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
	]);

	if (!project) error(404, 'Project not found');

	return { project, milestones: milestones ?? [], files: files ?? [], comments: comments ?? [], user };
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
