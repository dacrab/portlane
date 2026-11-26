import type { Action } from '@sveltejs/kit'
import { fail } from '@sveltejs/kit'
import { and, eq, or } from 'drizzle-orm'
import type { InvoiceStatus } from '#lib/domain/status.js'
import { authed } from '#lib/server/action.js'
import * as schema from '#lib/server/db/schema.js'
import { useDb } from '#lib/server/db.js'
import { str } from '#lib/server/form.js'
import { createCheckoutSession } from '#lib/server/stripe.js'

export async function createInvoice(input: {
	projectId: string
	clientId: string
	freelancerId: string
	amountCents: number
	dueDate: string | null
}) {
	await useDb().insert(schema.invoices).values(input)
}

export async function setInvoiceStatus(
	invoiceId: string,
	freelancerId: string,
	status: InvoiceStatus,
) {
	await useDb()
		.update(schema.invoices)
		.set({ status })
		.where(
			and(
				eq(schema.invoices.id, invoiceId),
				eq(schema.invoices.freelancerId, freelancerId),
			),
		)
}

export async function deleteInvoice(invoiceId: string, freelancerId: string) {
	await useDb()
		.delete(schema.invoices)
		.where(
			and(
				eq(schema.invoices.id, invoiceId),
				eq(schema.invoices.freelancerId, freelancerId),
			),
		)
}

export const checkoutAction: Action = authed(async ({ event, user, form }) => {
	const invoiceId = str(form, 'invoiceId')
	if (!invoiceId) return fail(400, { error: 'Invoice ID required' })

	const db = useDb()
	const [invoice] = await db
		.select({
			id: schema.invoices.id,
			projectId: schema.invoices.projectId,
			amountCents: schema.invoices.amountCents,
			currency: schema.invoices.currency,
			status: schema.invoices.status,
			stripeSessionId: schema.invoices.stripeSessionId,
			projectName: schema.projects.name,
		})
		.from(schema.invoices)
		.innerJoin(
			schema.projects,
			eq(schema.projects.id, schema.invoices.projectId),
		)
		.where(
			and(
				eq(schema.invoices.id, invoiceId),
				or(
					eq(schema.invoices.freelancerId, user.userId),
					eq(schema.invoices.clientId, user.userId),
				),
			),
		)
		.limit(1)

	if (!invoice) return fail(404, { error: 'Invoice not found' })
	if (invoice.stripeSessionId)
		return fail(400, { error: 'A payment session already exists' })
	if (invoice.status !== 'sent' && invoice.status !== 'overdue')
		return fail(400, { error: 'Invoice is not payable' })

	const portalUrl = `${event.url.origin}/portal?project=${invoice.projectId}`
	const result = await createCheckoutSession(
		{
			id: invoice.id,
			amountCents: invoice.amountCents,
			currency: invoice.currency,
			projectName: invoice.projectName,
		},
		user.role === 'client'
			? { successUrl: `${portalUrl}&payment=success`, cancelUrl: portalUrl }
			: {
					successUrl: `${event.url.origin}/dashboard/invoices/${invoice.id}?payment=success`,
					cancelUrl: `${event.url.origin}/dashboard/invoices/${invoice.id}`,
				},
	)

	await db
		.update(schema.invoices)
		.set({ stripeSessionId: result.sessionId })
		.where(eq(schema.invoices.id, invoice.id))

	return { url: result.url }
})
