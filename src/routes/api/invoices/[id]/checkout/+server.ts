import { error, json } from '@sveltejs/kit'
import { createCheckoutSession } from '$lib/server/stripe'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ locals, params, url: reqUrl }) => {
	const { user } = await locals.safeGetSession()
	if (!user) error(401)

	const { data: invoice, error: dbErr } = await locals.supabase
		.from('invoices')
		.select(
			'id, amount_cents, currency, status, client_id, stripe_session_id, projects(name)',
		)
		.eq('id', params.id)
		.single()

	if (dbErr || !invoice) error(404, 'Invoice not found')
	if (invoice.client_id !== user.id) error(403, 'Forbidden')
	if (invoice.status !== 'sent' && invoice.status !== 'overdue')
		error(400, 'Invoice is not payable')
	if (invoice.stripe_session_id)
		error(400, 'A payment session already exists for this invoice')

	const result = await createCheckoutSession(
		{
			id: invoice.id,
			amount_cents: invoice.amount_cents,
			currency: invoice.currency,
			project_name: invoice.projects?.name,
		},
		reqUrl.origin,
	)

	return json({ url: result.url })
}
