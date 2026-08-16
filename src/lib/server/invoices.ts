import { and, eq, or, sql } from 'drizzle-orm'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { createCheckoutSession } from '$lib/server/stripe'

export class InvoiceCheckoutError extends Error {
	constructor(
		readonly code: 'not_found' | 'not_payable' | 'duplicate_session',
		message: string,
	) {
		super(message)
	}
}

export async function createInvoiceCheckoutSession(
	invoiceId: string,
	userId: string,
	origin: string,
) {
	const db = useDb()
	const [invoice] = await db
		.select({
			id: schema.invoices.id,
			amountCents: schema.invoices.amountCents,
			currency: schema.invoices.currency,
			status: schema.invoices.status,
			stripeSessionId: schema.invoices.stripeSessionId,
			projectName: sql<string>`(SELECT name FROM project WHERE id = ${schema.invoices.projectId})`,
		})
		.from(schema.invoices)
		.where(
			and(
				eq(schema.invoices.id, invoiceId),
				or(
					eq(schema.invoices.freelancerId, userId),
					eq(schema.invoices.clientId, userId),
				),
			),
		)
		.limit(1)

	if (!invoice) throw new InvoiceCheckoutError('not_found', 'Invoice not found')
	if (invoice.stripeSessionId)
		throw new InvoiceCheckoutError(
			'duplicate_session',
			'A payment session already exists',
		)
	if (invoice.status !== 'sent' && invoice.status !== 'overdue')
		throw new InvoiceCheckoutError('not_payable', 'Invoice is not payable')

	const result = await createCheckoutSession(
		{
			id: invoice.id,
			amount_cents: invoice.amountCents,
			currency: invoice.currency,
			project_name: invoice.projectName,
		},
		origin,
	)

	return { url: result.url }
}