import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getProjectMilestones, getProjectFiles, getProjectComments, addComment, uploadProjectFile } from '$lib/server/project';

export const load: PageServerLoad = async ({ locals, url }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session) redirect(303, '/login');

	const projectId = url.searchParams.get('project');

	if (!projectId) {
		const { data: rows } = await locals.supabase
			.from('project_clients')
			.select('projects(id, name, status, due_date, profiles!projects_freelancer_id_fkey(full_name))')
			.eq('client_id', user!.id);

		const projects = (rows ?? []).map((r: any) => r.projects).filter(Boolean);
		return { project: null, projects, milestones: [], files: [], comments: [], invoices: [], user };
	}

	const [projectRes, milestonesRes, filesRes, commentsRes, invoicesRes] = await Promise.all([
		locals.supabase.from('projects').select('*, profiles!projects_freelancer_id_fkey(full_name)').eq('id', projectId).single(),
		getProjectMilestones(locals.supabase, projectId),
		getProjectFiles(locals.supabase, projectId),
		getProjectComments(locals.supabase, projectId),
		locals.supabase.from('invoices').select('*').eq('project_id', projectId).eq('client_id', user!.id).order('created_at', { ascending: false }),
	]);

	const project = projectRes.data;
	if (!project) error(404, 'Project not found');

	return { project, projects: [], milestones: milestonesRes.data ?? [], files: filesRes.data ?? [], comments: commentsRes.data ?? [], invoices: invoicesRes.data ?? [], user };
};

export const actions: Actions = {
	comment: async ({ locals, url, request }) => {
		const { user } = await locals.safeGetSession();
		if (!user) error(401);
		const projectId = url.searchParams.get('project')!;
		const form = await request.formData();
		const body = (form.get('body') as string).trim();
		if (!body) return;
		await addComment(locals.supabase, projectId, user.id, body);
	},

	approve: async ({ locals, url, request }) => {
		const { user } = await locals.safeGetSession();
		if (!user) error(401);
		const projectId = url.searchParams.get('project')!;
		const note = ((await request.formData()).get('note') as string | null)?.trim();
		await addComment(locals.supabase, projectId, user.id, note ? `✅ Approved — ${note}` : '✅ Approved');
		await locals.supabase.from('projects').update({ status: 'completed' }).eq('id', projectId);
	},

	request_revision: async ({ locals, url, request }) => {
		const { user } = await locals.safeGetSession();
		if (!user) error(401);
		const projectId = url.searchParams.get('project')!;
		const note = ((await request.formData()).get('note') as string | null)?.trim();
		await addComment(locals.supabase, projectId, user.id, note ? `🔄 Revision requested — ${note}` : '🔄 Revision requested');
		await locals.supabase.from('projects').update({ status: 'review' }).eq('id', projectId);
	},

	upload_file: async ({ locals, url, request }) => {
		const { user } = await locals.safeGetSession();
		if (!user) error(401);
		const projectId = url.searchParams.get('project')!;
		const form = await request.formData();
		const file = form.get('file') as File;
		if (!file?.size) return;
		try {
			await uploadProjectFile(locals.supabase, projectId, user.id, file);
		} catch (e: any) {
			error(500, e.message);
		}
	},
};
