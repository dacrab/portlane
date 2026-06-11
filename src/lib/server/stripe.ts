import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import { PUBLIC_APP_URL } from '$env/static/public';
import { getAdminClient } from '$lib/server/admin';

let _stripe: Stripe | undefined;

function stripe(): Stripe {
	if (!_stripe) {
		_stripe = new Stripe(STRIPE_SECRET_KEY);
	}
	return _stripe;
}

export { stripe as getStripe };

export async function createCheckoutSession(invoiceId: string, userId: string, origin?: string, returnPath?: string) {
	const { data: invoice } = await getAdminClient()
		.from('invoices')
		.select('*, projects!inner(name)')
		.eq('id', invoiceId)
		.single();

	if (!invoice) return { error: 'Invoice not found', status: 404 as const };
	if (invoice.client_id !== userId) return { error: 'Forbidden', status: 403 as const };
	if (invoice.status === 'paid') return { error: 'Already paid', status: 400 as const };

	const path = returnPath || `/dashboard/invoices/${invoiceId}`;
	const sep = path.includes('?') ? '&' : '?';
	const base = origin || PUBLIC_APP_URL;

	const session = await stripe().checkout.sessions.create({
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
		success_url: `${base}${path}${sep}payment=success`,
		cancel_url: `${base}${path}${sep}payment=canceled`,
	});

	await getAdminClient().from('invoices').update({ stripe_session_id: session.id }).eq('id', invoiceId);

	return { url: session.url, project_id: invoice.project_id, status: 200 as const };
}

export function getWebhookSecret(): string { return STRIPE_WEBHOOK_SECRET; }
