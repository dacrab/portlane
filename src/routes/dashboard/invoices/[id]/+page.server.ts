import { error } from '@sveltejs/kit'
import { sql } from 'drizzle-orm'
import { useDb } from '$lib/server/db'
import {
	handleCheckoutAction,
	type InvoiceDetailRow,
} from '$lib/server/invoices'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) error(401)
	const db = useDb()

	const [invoice] = (
		await db.execute<
			InvoiceDetailRow & {
				project_name: string
				project_description: string | null
				freelancer_name: string
				client_name: string
			}
		>(sql`
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
		const form = await request.formData()
		return handleCheckoutAction(locals, form, reqUrl.origin)
	},
}
