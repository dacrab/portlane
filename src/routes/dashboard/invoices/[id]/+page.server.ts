import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createCheckoutSession } from '$lib/server/stripe';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();

	const { data: invoice } = await locals.supabase
		.from('invoices')
		.select('*, projects(name, description), freelancer:profiles!invoices_freelancer_id_fkey(full_name), client:profiles!invoices_client_id_fkey(full_name)')
		.eq('id', params.id)
		.single();

	if (!invoice) error(404, 'Invoice not found');

	if (invoice.freelancer_id !== user?.id && invoice.client_id !== user?.id) {
		error(403, 'Forbidden');
	}

	return { invoice, user };
};

export const actions: Actions = {
	checkout: async ({ locals, request }) => {
		const { user } = await locals.safeGetSession();
		if (!user) error(401);

		const form = await request.formData();
		const invoiceId = form.get('invoiceId') as string;
		if (!invoiceId) return fail(400, { missing: true });

		const result = await createCheckoutSession(invoiceId, user.id, '', `/dashboard/invoices/${invoiceId}`);
		if (result.error) return fail(result.status, { error: result.error });
		return { url: result.url };
	},
};
