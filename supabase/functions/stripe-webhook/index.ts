import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { Stripe } from 'https://esm.sh/stripe@17.3.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1?target=deno'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    return new Response('Server configuration error', { status: 500 })
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-11-20.acacia', httpClient: Stripe.createFetchHttpClient() })

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return new Response('OK', { status: 200 })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const invoiceId = session.client_reference_id ?? session.metadata?.invoiceId

  if (!invoiceId) {
    return new Response('No invoice ID', { status: 200 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error } = await supabase
    .from('invoices')
    .update({
      status: 'paid',
      stripe_payment_intent_id: String(session.payment_intent ?? ''),
    })
    .eq('id', invoiceId)
    .eq('stripe_session_id', session.id)

  if (error) {
    console.error('Failed to update invoice:', error)
    return new Response('Database error', { status: 500 })
  }

  return new Response('OK', { status: 200 })
})
