import { text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStripe, getWebhookSecret } from '$lib/server/stripe';
import { getAdminClient } from '$lib/server/admin';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.text();
	const sig = request.headers.get('stripe-signature');
	if (!sig) return text('Missing stripe-signature', { status: 400 });

	let event;
	try {
		event = getStripe().webhooks.constructEvent(body, sig, getWebhookSecret());
	} catch {
		return text('Invalid signature', { status: 400 });
	}

	if (event.type !== 'checkout.session.completed') {
		return text('Received', { status: 200 });
	}

	const session = event.data.object;
	const invoiceId = session.client_reference_id ?? session.metadata?.invoiceId;
	if (!invoiceId) return text('No invoice ID', { status: 200 });

	await getAdminClient()
		.from('invoices')
		.update({
			status: 'paid',
			stripe_payment_intent_id: String(session.payment_intent ?? ''),
		})
		.eq('id', invoiceId)
		.eq('stripe_session_id', session.id);

	return text('Received', { status: 200 });
};
