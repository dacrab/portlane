import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { adminClient } from '$lib/admin';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	const { data: projects } = await locals.supabase
		.from('projects')
		.select('*, milestones(completed), project_clients(count)')
		.eq('freelancer_id', user!.id)
		.order('created_at', { ascending: false });
	return { projects: projects ?? [] };
};

export const actions: Actions = {
	create: async ({ locals, request, url }) => {
		const { user } = await locals.safeGetSession();
		const form = await request.formData();
		const name = (form.get('name') as string).trim();
		const description = (form.get('description') as string | null)?.trim() || null;
		const due_date = (form.get('due_date') as string | null) || null;
		const status = (form.get('status') as string) || 'planning';
		const client_email = (form.get('client_email') as string | null)?.trim().toLowerCase() || null;

		if (!name) return fail(400, { error: 'Name is required' });

		const { data, error } = await locals.supabase
			.from('projects')
			.insert({ name, description, due_date, status, freelancer_id: user!.id })
			.select('id')
			.single();

		if (error) return fail(500, { error: error.message });

		if (client_email) {
			await adminClient.auth.admin.inviteUserByEmail(client_email, {
				data: { role: 'client' },
				redirectTo: `${url.origin}/auth/callback?next=/portal?project=${data.id}`,
			});
		}

		redirect(303, `/dashboard/projects/${data.id}`);
	},
};
