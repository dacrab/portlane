import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1?target=deno'
import { Stripe } from 'https://esm.sh/stripe@17.3.0?target=deno'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../_shared/env.ts'

serve(async (req) => {
	if (req.method !== 'POST') {
		return new Response('Method not allowed', { status: 405 })
	}

	const authHeader = req.headers.get('Authorization')
	if (!authHeader) {
		return new Response('Unauthorized', { status: 401 })
	}

	const supabaseUrl = SUPABASE_URL
	const supabaseAnonKey = SUPABASE_ANON_KEY
	const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
	const appUrl = Deno.env.get('PUBLIC_APP_URL')

	if (!supabaseUrl || !supabaseAnonKey || !stripeSecretKey || !appUrl) {
		return new Response('Server configuration error', { status: 500 })
	}

	const supabase = createClient(supabaseUrl, supabaseAnonKey, {
		global: { headers: { Authorization: authHeader } },
	})

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser()
	if (userError || !user) {
		return new Response('Unauthorized', { status: 401 })
	}

	let body: { invoiceId: string; origin?: string; returnPath?: string }
	try {
		body = await req.json()
	} catch {
		return new Response('Invalid JSON', { status: 400 })
	}

	if (!body.invoiceId) {
		return new Response('Missing invoiceId', { status: 400 })
	}

	const { data: invoice, error: invoiceError } = await supabase
		.from('invoices')
		.select('*, projects!inner(name)')
		.eq('id', body.invoiceId)
		.single()

	if (invoiceError || !invoice) {
		return new Response('Invoice not found', { status: 404 })
	}

	if (invoice.client_id !== user.id) {
		return new Response('Forbidden', { status: 403 })
	}

	if (invoice.status === 'paid') {
		return new Response('Already paid', { status: 400 })
	}

	const stripe = new Stripe(stripeSecretKey, {
		apiVersion: '2024-11-20.acacia',
		httpClient: Stripe.createFetchHttpClient(),
	})

	const path = body.returnPath || `/dashboard/invoices/${body.invoiceId}`
	const sep = path.includes('?') ? '&' : '?'

	const appOrigin = new URL(appUrl).origin
	let base = appUrl
	if (body.origin) {
		try {
			if (new URL(body.origin).origin === appOrigin) {
				base = body.origin
			}
		} catch {
			// ignore invalid origin URL, fall back to appUrl
		}
	}

	const session = await stripe.checkout.sessions.create({
		mode: 'payment',
		payment_method_types: ['card'],
		line_items: [
			{
				price_data: {
					// Currency is hardcoded to USD; invoices do not store a currency column.
					currency: 'usd',
					product_data: {
						name: `Invoice — ${invoice.projects?.name ?? 'Project'}`,
					},
					unit_amount: invoice.amount_cents,
				},
				quantity: 1,
			},
		],
		client_reference_id: body.invoiceId,
		metadata: { invoiceId: body.invoiceId },
		success_url: `${base}${path}${sep}payment=success`,
		cancel_url: `${base}${path}${sep}payment=canceled`,
	})

	const { error: updateError } = await supabase
		.from('invoices')
		.update({ stripe_session_id: session.id })
		.eq('id', body.invoiceId)

	if (updateError) {
		console.error('Failed to save session ID:', updateError)
		return new Response('Failed to create checkout session', { status: 500 })
	}

	return new Response(JSON.stringify({ url: session.url }), {
		headers: { 'Content-Type': 'application/json' },
	})
})
