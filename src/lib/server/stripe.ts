import Stripe from 'stripe'
import { buildInvoiceLineItems } from '#lib/stripe.js'
import { STRIPE_SECRET_KEY } from '$app/env/private'

export async function createCheckoutSession(
	invoice: {
		id: string
		amount_cents: number
		currency: string
		project_name?: string | null
	},
	origin: string,
): Promise<{ url: string; sessionId: string }> {
	const key = STRIPE_SECRET_KEY

	if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')

	const stripe = new Stripe(key)

	const session = await stripe.checkout.sessions.create({
		mode: 'payment',
		line_items: buildInvoiceLineItems({
			amount_cents: invoice.amount_cents,
			currency: invoice.currency,
			project_name: invoice.project_name,
		}),
		client_reference_id: invoice.id,
		success_url: `${origin}/dashboard/invoices/${invoice.id}?payment=success`,
		cancel_url: `${origin}/dashboard/invoices/${invoice.id}`,
	})

	if (!session.url) throw new Error('Stripe returned a session without a URL')

	return { url: session.url, sessionId: session.id }
}
