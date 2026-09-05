import { error, fail } from '@sveltejs/kit'
import { and, eq, sql } from 'drizzle-orm'
import { INVOICE_STATUS_ITEMS } from '$lib/fmt'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { DB_ERROR, num, str } from '$lib/server/form'
import {
	handleCheckoutAction,
	type InvoiceDetailRow,
} from '$lib/server/invoices'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) error(401)
	const userId = locals.user.userId
	const db = useDb()

	const [invoices, projects] = await Promise.all([
		db.execute<
			InvoiceDetailRow & { project_name: string; client_name: string }
		>(
			sql`
			SELECT i.*, p.name AS project_name, u.name AS client_name
			FROM invoice i
			JOIN project p ON p.id = i.project_id
			JOIN "user" u ON u.id = i.client_id
			WHERE i.freelancer_id = ${userId}
			ORDER BY i.created_at DESC
		`,
		),
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

const validStatuses: string[] = INVOICE_STATUS_ITEMS.map((s) => s.value)

export const actions: Actions = {
	create: async ({ locals, request }) => {
		if (!locals.user) error(401)
		const form = await request.formData()
		const project_id = str(form, 'project_id')
		const client_id = str(form, 'client_id')
		const amount = num(form, 'amount', NaN)
		const due_date = str(form, 'due_date') || null

		if (!(project_id && client_id) || Number.isNaN(amount))
			return fail(400, { error: 'Missing fields' })
		if (!(amount > 0)) return fail(400, { error: 'Amount must be positive' })
		if (due_date && !/^\d{4}-\d{2}-\d{2}$/.test(due_date))
			return fail(400, { error: 'Invalid due date' })

		const db = useDb()
		const [project] = await db
			.select({ id: schema.projects.id })
			.from(schema.projects)
			.where(
				and(
					eq(schema.projects.id, project_id),
					eq(schema.projects.freelancerId, locals.user.userId),
				),
			)
			.limit(1)
		if (!project)
			return fail(400, { error: 'Project not found in your workspace' })

		const [link] = await db
			.select({ projectId: schema.projectClients.projectId })
			.from(schema.projectClients)
			.where(
				and(
					eq(schema.projectClients.projectId, project_id),
					eq(schema.projectClients.clientId, client_id),
				),
			)
			.limit(1)
		if (!link)
			return fail(400, { error: 'Client is not linked to this project' })

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
		const form = await request.formData()
		return handleCheckoutAction(locals, form, reqUrl.origin)
	},

	update_status: async ({ locals, request }) => {
		if (!locals.user) error(401)
		const form = await request.formData()
		const id = str(form, 'id')
		const status = str(form, 'status')
		if (!validStatuses.includes(status))
			return fail(400, { error: 'Invalid status' })
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
