import { error, fail } from '@sveltejs/kit'
import { eq, sql } from 'drizzle-orm'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { str } from '$lib/server/form'
import { createCheckoutSession } from '$lib/server/stripe'
import type { Actions, PageServerLoad } from './$types'

interface InvoiceDetail extends Record<string, unknown> {
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
	project_name: string
	project_description: string | null
	freelancer_name: string
	client_name: string
}

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) error(401)
	const db = useDb()

	const [invoice] = (
		await db.execute<InvoiceDetail>(sql`
		SELECT i.*, p.name AS project_name, p.description AS project_description,
			u_f.name AS freelancer_name, u_c.name AS client_name
		FROM invoice i
		JOIN project p ON p.id = i.project_id
		JOIN "user" u_f ON u_f.id = i.freelancer_id
		JOIN "user" u_c ON u_c.id = i.client_id
		WHERE i.id = ${params.id}
	`)
	).rows

	if (!invoice) error(404, 'Invoice not found')

	if (
		invoice.freelancer_id !== locals.user.userId &&
		invoice.client_id !== locals.user.userId
	) {
		error(403, 'Forbidden')
	}

	return { invoice, user: locals.user }
}

export const actions: Actions = {
	checkout: async ({ locals, request, url: reqUrl }) => {
		if (!locals.user) error(401)
		const form = await request.formData()
		const invoiceId = str(form, 'invoiceId')
		if (!invoiceId) return fail(400, { missing: true })

		const db = useDb()
		const [invoice] = await db
			.select({
				id: schema.invoices.id,
				amountCents: schema.invoices.amountCents,
				currency: schema.invoices.currency,
				projectName: sql<string>`(SELECT name FROM project WHERE id = ${schema.invoices.projectId})`,
			})
			.from(schema.invoices)
			.where(eq(schema.invoices.id, invoiceId))
			.limit(1)

		if (!invoice) return fail(404, { error: 'Invoice not found' })

		const result = await createCheckoutSession(
			{
				id: invoice.id,
				amount_cents: invoice.amountCents,
				currency: invoice.currency,
				project_name: invoice.projectName,
			},
			reqUrl.origin,
		)

		return { url: result.url }
	},
}
