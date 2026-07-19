import { error, fail } from '@sveltejs/kit'
import { and, eq, sql } from 'drizzle-orm'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { DB_ERROR, num, str } from '$lib/server/form'
import { createCheckoutSession } from '$lib/server/stripe'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) error(401)
	const userId = locals.user.userId
	const db = useDb()

	const [invoices, projects] = await Promise.all([
		db.execute<{
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
			client_name: string
		}>(sql`
			SELECT i.*, p.name AS project_name, u.name AS client_name
			FROM invoice i
			JOIN project p ON p.id = i.project_id
			JOIN "user" u ON u.id = i.client_id
			WHERE i.freelancer_id = ${userId}
			ORDER BY i.created_at DESC
		`),
		db.execute<{
			id: string
			name: string
			clients: { id: string; name: string | null }[] | null
		}>(sql`
			SELECT p.id, p.name,
				json_agg(json_build_object('id', pc.client_id, 'name', u.name))
				FILTER (WHERE pc.client_id IS NOT NULL) AS clients
			FROM project p
			LEFT JOIN project_client pc ON pc.project_id = p.id
			LEFT JOIN "user" u ON u.id = pc.client_id
			WHERE p.freelancer_id = ${userId} AND p.status <> 'archived'
			GROUP BY p.id, p.name
		`),
	])

	return {
		invoices: invoices.rows,
		projects: projects.rows,
	}
}

export const actions: Actions = {
	create: async ({ locals, request }) => {
		if (!locals.user) error(401)
		const form = await request.formData()
		const project_id = str(form, 'project_id')
		const client_id = str(form, 'client_id')
		const amount = num(form, 'amount', NaN)
		const due_date = str(form, 'due_date') || null

		if (!project_id || !client_id || Number.isNaN(amount))
			return fail(400, { error: 'Missing fields' })

		const db = useDb()
		try {
			await db.insert(schema.invoices).values({
				projectId: project_id,
				clientId: client_id,
				freelancerId: locals.user.userId,
				amountCents: Math.round(amount * 100),
				dueDate: due_date,
			})
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	checkout: async ({ locals, request, url: reqUrl }) => {
		if (!locals.user) return fail(401, { error: 'Unauthorized' })
		const form = await request.formData()
		const invoiceId = str(form, 'invoiceId')
		if (!invoiceId) return fail(400, { error: 'Invoice ID required' })

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
					eq(schema.invoices.freelancerId, locals.user.userId),
				),
			)
			.limit(1)

		if (!invoice) return fail(404, { error: 'Invoice not found' })
		if (invoice.stripeSessionId)
			return fail(400, { error: 'A payment session already exists' })

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

	update_status: async ({ locals, request }) => {
		if (!locals.user) error(401)
		const form = await request.formData()
		const id = str(form, 'id')
		const status = str(form, 'status')
		const db = useDb()
		await db
			.update(schema.invoices)
			.set({ status })
			.where(
				and(
					eq(schema.invoices.id, id),
					eq(schema.invoices.freelancerId, locals.user.userId),
				),
			)
	},

	delete: async ({ locals, request }) => {
		if (!locals.user) error(401)
		const form = await request.formData()
		const id = str(form, 'id')
		const db = useDb()
		await db
			.delete(schema.invoices)
			.where(
				and(
					eq(schema.invoices.id, id),
					eq(schema.invoices.freelancerId, locals.user.userId),
				),
			)
	},
}
