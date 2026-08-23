import { error, text } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'
import { env } from '$env/dynamic/private'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import type { RequestHandler } from './$types'

interface PaidSession {
	invoiceId: string
	sessionId: string | null
	paymentIntent: string | null
	amountTotal: number
}

function extractPaidSession(event: Stripe.Event): PaidSession | null {
	if (event.type !== 'checkout.session.completed') return null
	const session = event.data.object as Stripe.Checkout.Session
	if (session.payment_status !== 'paid') return null
	if (!session.client_reference_id || session.amount_total == null) return null
	return {
		invoiceId: session.client_reference_id,
		sessionId: session.id ?? null,
		paymentIntent:
			typeof session.payment_intent === 'string'
				? session.payment_intent
				: null,
		amountTotal: session.amount_total,
	}
}

export const POST: RequestHandler = async ({ request }) => {
	const secret = env.STRIPE_WEBHOOK_SECRET
	const stripeKey = env.STRIPE_SECRET_KEY
	if (!(secret && stripeKey)) error(500, 'Stripe is not configured')

	const stripe = new Stripe(stripeKey)
	const sig = request.headers.get('stripe-signature')
	if (!sig) error(400, 'Missing stripe-signature header')

	const body = await request.text()
	let event: Stripe.Event
	try {
		event = stripe.webhooks.constructEvent(body, sig, secret)
	} catch {
		error(400, 'Invalid webhook signature')
	}

	const paid = extractPaidSession(event)
	if (!paid) return text('ok')

	const db = useDb()
	const [invoice] = await db
		.select({ amountCents: schema.invoices.amountCents })
		.from(schema.invoices)
		.where(eq(schema.invoices.id, paid.invoiceId))
		.limit(1)

	if (!invoice || invoice.amountCents !== paid.amountTotal) return text('ok')

	await db
		.update(schema.invoices)
		.set({
			status: 'paid',
			stripeSessionId: paid.sessionId,
			stripePaymentIntentId: paid.paymentIntent,
		})
		.where(eq(schema.invoices.id, paid.invoiceId))

	return text('ok')
}
