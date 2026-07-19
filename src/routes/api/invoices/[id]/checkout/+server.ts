import { error, json } from '@sveltejs/kit'
import { eq, sql } from 'drizzle-orm'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { createCheckoutSession } from '$lib/server/stripe'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ locals, params, url: reqUrl }) => {
	if (!locals.user) error(401)

	const db = useDb()
	const [invoice] = await db
		.select({
			id: schema.invoices.id,
			amountCents: schema.invoices.amountCents,
			currency: schema.invoices.currency,
			status: schema.invoices.status,
			clientId: schema.invoices.clientId,
			stripeSessionId: schema.invoices.stripeSessionId,
			projectName: sql<string>`(SELECT name FROM project WHERE id = ${schema.invoices.projectId})`,
		})
		.from(schema.invoices)
		.innerJoin(
			schema.projects,
			eq(schema.projects.id, schema.invoices.projectId),
		)
		.where(eq(schema.invoices.id, params.id))
		.limit(1)

	if (!invoice) error(404, 'Invoice not found')
	if (invoice.clientId !== locals.user.userId) error(403, 'Forbidden')
	if (invoice.status !== 'sent' && invoice.status !== 'overdue')
		error(400, 'Invoice is not payable')
	if (invoice.stripeSessionId)
		error(400, 'A payment session already exists for this invoice')

	const result = await createCheckoutSession(
		{
			id: invoice.id,
			amount_cents: invoice.amountCents,
			currency: invoice.currency,
			project_name: invoice.projectName,
		},
		reqUrl.origin,
	)

	return json({ url: result.url })
}
