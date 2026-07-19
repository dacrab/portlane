import { error, text } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'
import { env } from '$env/dynamic/private'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
	const secret = env.STRIPE_WEBHOOK_SECRET
	const stripeKey = env.STRIPE_SECRET_KEY
	if (!secret || !stripeKey) error(500, 'Stripe is not configured')

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

	if (event.type !== 'checkout.session.completed') return text('ok')

	const obj: unknown = event.data.object
	if (!obj || typeof obj !== 'object') error(400, 'Invalid event object')
	const session = obj as {
		client_reference_id: unknown
		id: unknown
		payment_intent: unknown
	}
	const invoiceId =
		typeof session.client_reference_id === 'string'
			? session.client_reference_id
			: null
	if (!invoiceId) return text('ok')

	const sessionId = typeof session.id === 'string' ? session.id : null
	const paymentIntent =
		typeof session.payment_intent === 'string' ? session.payment_intent : null

	const db = useDb()
	await db
		.update(schema.invoices)
		.set({
			status: 'paid',
			stripeSessionId: sessionId,
			stripePaymentIntentId: paymentIntent,
		})
		.where(eq(schema.invoices.id, invoiceId))

	return text('ok')
}
