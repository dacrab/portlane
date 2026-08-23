import { fail } from '@sveltejs/kit'
import { and, eq, or, sql } from 'drizzle-orm'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { createCheckoutSession } from '$lib/server/stripe'

export interface InvoiceDetailRow {
	[key: string]: unknown
	id: string
	project_id: string
	freelancer_id: string
	client_id: string
	amount_cents: number
	currency: string
	status: string
	due_date: string | null
	stripe_session_id: string | null
	stripe_payment_intent_id: string | null
	last_reminder_sent_at: string | null
	created_at: string
}

class InvoiceCheckoutError extends Error {
	constructor(
		readonly code: 'not_found' | 'not_payable' | 'duplicate_session',
		message: string,
	) {
		super(message)
	}
}

async function createInvoiceCheckoutSession(
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

	await db
		.update(schema.invoices)
		.set({ stripeSessionId: result.sessionId })
		.where(eq(schema.invoices.id, invoice.id))

	return { url: result.url }
}

type CheckoutResult =
	| { url: string }
	| ReturnType<typeof fail<{ error: string }>>

export async function runInvoiceCheckout(
	invoiceId: string,
	userId: string,
	origin: string,
): Promise<CheckoutResult> {
	try {
		return await createInvoiceCheckoutSession(invoiceId, userId, origin)
	} catch (e) {
		if (e instanceof InvoiceCheckoutError)
			return fail(e.code === 'not_found' ? 404 : 400, { error: e.message })
		throw e
	}
}
