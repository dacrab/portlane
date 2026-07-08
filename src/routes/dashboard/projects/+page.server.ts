import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { inviteClientByEmail } from '$lib/server/project';
import { str } from '$lib/server/form';

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
		const name = str(form, 'name');
		const description = str(form, 'description') || null;
		const due_date = str(form, 'due_date') || null;
		const status = str(form, 'status', 'planning');
		const client_email = str(form, 'client_email').toLowerCase() || null;

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
