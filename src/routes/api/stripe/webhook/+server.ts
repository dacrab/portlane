import { createClient } from '@supabase/supabase-js'
import { error, text } from '@sveltejs/kit'
import Stripe from 'stripe'
import { env } from '$env/dynamic/private'
import type { Database } from '$lib/database.types'
import { PUBLIC_SUPABASE_URL } from '$lib/env'
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

	const session = event.data.object as Stripe.Checkout.Session
	const invoiceId = session.client_reference_id
	if (!invoiceId) return text('ok')

	const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
	if (!serviceKey) error(500, 'SUPABASE_SERVICE_ROLE_KEY not configured')

	const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, serviceKey)
	await supabase
		.from('invoices')
		.update({
			status: 'paid',
			stripe_session_id: session.id,
			stripe_payment_intent_id:
				typeof session.payment_intent === 'string'
					? session.payment_intent
					: null,
		})
		.eq('id', invoiceId)

	return text('ok')
}
