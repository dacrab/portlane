import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { stripe } from '$lib/server/stripe';
import { createClient } from '@supabase/supabase-js';

export const POST: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.safeGetSession();
	if (!user) return json({ error: 'Not authenticated' }, { status: 401 });

	const { invoiceId } = await request.json();
	if (!invoiceId) return json({ error: 'invoiceId required' }, { status: 400 });

	const adminClient = createClient(
		process.env.PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SECRET_KEY!,
		{ auth: { autoRefreshToken: false, persistSession: false } },
	);

	const { data: invoice } = await adminClient
		.from('invoices')
		.select('*, projects!inner(name)')
		.eq('id', invoiceId)
		.single();

	if (!invoice) return json({ error: 'Invoice not found' }, { status: 404 });
	if (invoice.client_id !== user.id) return json({ error: 'Forbidden' }, { status: 403 });
	if (invoice.status === 'paid') return json({ error: 'Already paid' }, { status: 400 });

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

	return json({ url: session.url });
};
