import Stripe from 'stripe';
import { env as privateEnv } from '$env/dynamic/private';
import { env } from '$env/dynamic/public';
import { getAdminClient } from '$lib/server/admin';

export function getStripe() {
	return new Stripe(privateEnv.STRIPE_SECRET_KEY!);
}

export async function createCheckoutSession(invoiceId: string, userId: string, origin?: string, returnPath?: string) {
	const { data: invoice } = await getAdminClient()
		.from('invoices')
		.select('*, projects(name)')
		.eq('id', invoiceId)
		.single();

	if (!invoice) return { error: 'Invoice not found', status: 404 as const };
	if (invoice.client_id !== userId) return { error: 'Forbidden', status: 403 as const };
	if (invoice.status === 'paid') return { error: 'Already paid', status: 400 as const };

	const path = returnPath || `/dashboard/invoices/${invoiceId}`;
	const sep = path.includes('?') ? '&' : '?';
	const base = origin || env.PUBLIC_APP_URL!;

	const session = await getStripe().checkout.sessions.create({
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

export function getWebhookSecret(): string { return privateEnv.STRIPE_WEBHOOK_SECRET!; }
