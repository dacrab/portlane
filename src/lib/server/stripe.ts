import Stripe from 'stripe'
import { buildInvoiceLineItems } from '#lib/stripe.js'
import { STRIPE_SECRET_KEY } from '$app/env/private'

export async function createCheckoutSession(
	invoice: {
		id: string
		amountCents: number
		currency: string
		projectName?: string | null
	},
	urls: { successUrl: string; cancelUrl: string },
): Promise<{ url: string; sessionId: string }> {
	const key = STRIPE_SECRET_KEY

	if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')

	const stripe = new Stripe(key)

	const session = await stripe.checkout.sessions.create({
		mode: 'payment',
		line_items: buildInvoiceLineItems(invoice),
		client_reference_id: invoice.id,
		success_url: urls.successUrl,
		cancel_url: urls.cancelUrl,
	})

	if (!session.url) throw new Error('Stripe returned a session without a URL')

	return { url: session.url, sessionId: session.id }
}
