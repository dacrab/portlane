import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();

	const [{ data: invoices }, { data: projects }] = await Promise.all([
		locals.supabase
			.from('invoices')
			.select('*, projects(name), profiles!invoices_client_id_fkey(full_name)')
			.eq('freelancer_id', user!.id)
			.order('created_at', { ascending: false }),
		locals.supabase
			.from('projects')
			.select('id, name, project_clients(profiles(id, full_name))')
			.eq('freelancer_id', user!.id)
			.neq('status', 'archived'),
	]);

	return { invoices: invoices ?? [], projects: projects ?? [] };
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		const { user } = await locals.safeGetSession();
		const form = await request.formData();
		const project_id = form.get('project_id') as string;
		const client_id = form.get('client_id') as string;
		const amount = parseFloat(form.get('amount') as string);
		const due_date = (form.get('due_date') as string) || null;

		if (!project_id || !client_id || isNaN(amount)) return fail(400, { error: 'Missing fields' });

		const { error: insertErr } = await locals.supabase.from('invoices').insert({
			project_id,
			client_id,
			freelancer_id: user!.id,
			amount_cents: Math.round(amount * 100),
			due_date,
		});
		if (insertErr) return fail(500, { error: insertErr.message });
	},

	update_status: async ({ locals, request }) => {
		const { user } = await locals.safeGetSession();
		const form = await request.formData();
		const id = form.get('id') as string;
		const status = form.get('status') as string;
		const { data: inv } = await locals.supabase.from('invoices').select('freelancer_id').eq('id', id).single();
		if (inv?.freelancer_id !== user!.id) return fail(403, { error: 'Forbidden' });
		await locals.supabase.from('invoices').update({ status }).eq('id', id);
	},

	delete: async ({ locals, request }) => {
		const { user } = await locals.safeGetSession();
		const form = await request.formData();
		const id = form.get('id') as string;
		const { data: inv } = await locals.supabase.from('invoices').select('freelancer_id').eq('id', id).single();
		if (inv?.freelancer_id !== user!.id) return fail(403, { error: 'Forbidden' });
		await locals.supabase.from('invoices').delete().eq('id', id);
	},
};
