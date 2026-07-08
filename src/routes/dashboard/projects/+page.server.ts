import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { inviteClientByEmail } from '$lib/server/project';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) error(401);
	const { data: projects } = await locals.supabase
		.from('projects')
		.select('*, milestones(completed), project_clients(count)')
		.eq('freelancer_id', user.id)
		.order('created_at', { ascending: false });
	return { projects: projects ?? [] };
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		const { session, user } = await locals.safeGetSession();
		if (!user) error(401);
		if (!session) error(401);
		const form = await request.formData();
		const name_val = form.get('name');
		const description_val = form.get('description');
		const due_date_val = form.get('due_date');
		const status_val = form.get('status');
		const client_email_val = form.get('client_email');
		const name = typeof name_val === 'string' ? name_val.trim() : '';
		const description = typeof description_val === 'string' ? description_val.trim() : null;
		const due_date = typeof due_date_val === 'string' ? due_date_val : null;
		const status = typeof status_val === 'string' ? status_val : 'planning';
		const client_email = typeof client_email_val === 'string' ? client_email_val.trim().toLowerCase() : null;

		if (!name) return fail(400, { error: 'Name is required' });

		const { data, error: insertErr } = await locals.supabase
			.from('projects')
			.insert({ name, description, due_date, status, freelancer_id: user.id })
			.select('id')
			.single();

		if (insertErr) return fail(500, { error: insertErr.message });

		if (client_email) {
			const inviteErr = await inviteClientByEmail(session.access_token, client_email, data.id);
			if (inviteErr) console.error('Invite failed:', inviteErr.message);
		}

		redirect(303, `/dashboard/projects/${data.id}`);
	},
};
