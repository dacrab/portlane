import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createCheckoutSessionViaEdge } from '$lib/server/stripe';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) error(401);

	const [{ data: invoices }, { data: projects }] = await Promise.all([
		locals.supabase
			.from('invoices')
			.select('*, projects(name), profiles!invoices_client_id_fkey(full_name)')
			.eq('freelancer_id', user.id)
			.order('created_at', { ascending: false }),
		locals.supabase
			.from('projects')
			.select('id, name, project_clients(profiles(id, full_name))')
			.eq('freelancer_id', user.id)
			.neq('status', 'archived'),
	]);

	return { invoices: invoices ?? [], projects: projects ?? [] };
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		const { user } = await locals.safeGetSession();
		if (!user) error(401);
		const form = await request.formData();
		const project_id_val = form.get('project_id');
		const client_id_val = form.get('client_id');
		const amount_val = form.get('amount');
		const due_date_val = form.get('due_date');
		const project_id = typeof project_id_val === 'string' ? project_id_val : '';
		const client_id = typeof client_id_val === 'string' ? client_id_val : '';
		const amount = typeof amount_val === 'string' ? parseFloat(amount_val) : NaN;
		const due_date = typeof due_date_val === 'string' ? due_date_val : null;

		if (!project_id || !client_id || isNaN(amount)) return fail(400, { error: 'Missing fields' });

		const { error: insertErr } = await locals.supabase.from('invoices').insert({
			project_id,
			client_id,
			freelancer_id: user.id,
			amount_cents: Math.round(amount * 100),
			due_date,
		});
		if (insertErr) return fail(500, { error: insertErr.message });
	},

	checkout: async ({ locals, request, url: reqUrl }) => {
		const { session, user } = await locals.safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });
		if (!session) return fail(401, { error: 'Unauthorized' });

		const form = await request.formData();
		const invoiceId_val = form.get('invoiceId');
		const invoiceId = typeof invoiceId_val === 'string' ? invoiceId_val : '';
		if (!invoiceId) return fail(400, { error: 'Invoice ID required' });

		const result = await createCheckoutSessionViaEdge(
			invoiceId, session.access_token, reqUrl.origin, `/dashboard/invoices/${invoiceId}`,
		);
		if ('error' in result) return fail(result.status, { error: result.error });
		return { url: result.url };
	},

	update_status: async ({ locals, request }) => {
		const { user } = await locals.safeGetSession();
		if (!user) error(401);
		const form = await request.formData();
		const id_val = form.get('id');
		const status_val = form.get('status');
		const id = typeof id_val === 'string' ? id_val : '';
		const status = typeof status_val === 'string' ? status_val : '';
		const { data: inv } = await locals.supabase.from('invoices').select('freelancer_id').eq('id', id).single();
		if (inv?.freelancer_id !== user.id) return fail(403, { error: 'Forbidden' });
		await locals.supabase.from('invoices').update({ status }).eq('id', id);
	},

	delete: async ({ locals, request }) => {
		const { user } = await locals.safeGetSession();
		if (!user) error(401);
		const form = await request.formData();
		const id_val = form.get('id');
		const id = typeof id_val === 'string' ? id_val : '';
		const { data: inv } = await locals.supabase.from('invoices').select('freelancer_id').eq('id', id).single();
		if (inv?.freelancer_id !== user.id) return fail(403, { error: 'Forbidden' });
		await locals.supabase.from('invoices').delete().eq('id', id);
	},
};
