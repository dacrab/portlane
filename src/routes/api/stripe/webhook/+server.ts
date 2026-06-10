import { text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStripe } from '$lib/server/stripe';
import { createClient } from '@supabase/supabase-js';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.text();
	const sig = request.headers.get('stripe-signature');
	if (!sig) return text('Missing stripe-signature', { status: 400 });

	const secret = process.env.STRIPE_WEBHOOK_SECRET;
	if (!secret) return text('Webhook secret not configured', { status: 500 });

	let event;
	try {
		event = getStripe().webhooks.constructEvent(body, sig, secret);
	} catch {
		return text('Invalid signature', { status: 400 });
	}

	if (event.type !== 'checkout.session.completed') {
		return text('Received', { status: 200 });
	}

	const session = event.data.object;
	const invoiceId = session.client_reference_id ?? session.metadata?.invoiceId;
	if (!invoiceId) return text('No invoice ID', { status: 200 });

	const adminClient = createClient(
		process.env.PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SECRET_KEY!,
		{ auth: { autoRefreshToken: false, persistSession: false } },
	);

	await adminClient
		.from('invoices')
		.update({
			status: 'paid',
			stripe_payment_intent_id: session.payment_intent as string,
		})
		.eq('id', invoiceId)
		.eq('stripe_session_id', session.id);

	return text('Received', { status: 200 });
};
