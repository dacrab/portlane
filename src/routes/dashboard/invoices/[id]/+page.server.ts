import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { stripe } from '$lib/server/stripe';
import { createClient } from '@supabase/supabase-js';

const adminClient = createClient(
	process.env.PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SECRET_KEY!,
	{ auth: { autoRefreshToken: false, persistSession: false } },
);

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

		const { data: invoice } = await adminClient
			.from('invoices')
			.select('*, projects!inner(name)')
			.eq('id', invoiceId)
			.single();

		if (!invoice) return fail(404, { missing: true });
		if (invoice.client_id !== user.id) return fail(403, { forbidden: true });
		if (invoice.status === 'paid') return fail(400, { paid: true });

		const session = await stripe.checkout.sessions.create({
			mode: 'payment',
			payment_method_types: ['card'],
			line_items: [
				{
					price_data: {
						currency: invoice.currency,
						product_data: {
							name: `Invoice — ${invoice.projects?.name ?? 'Project'}`,
						},
						unit_amount: invoice.amount_cents,
					},
					quantity: 1,
				},
			],
			client_reference_id: invoiceId,
			metadata: { invoiceId },
			success_url: `${process.env.PUBLIC_APP_URL}/dashboard/invoices/${invoiceId}?payment=success`,
			cancel_url: `${process.env.PUBLIC_APP_URL}/dashboard/invoices/${invoiceId}?payment=canceled`,
		});

		await adminClient.from('invoices').update({ stripe_session_id: session.id }).eq('id', invoiceId);

		return { url: session.url };
	},
};
