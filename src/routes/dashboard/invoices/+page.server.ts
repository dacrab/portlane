import { error, fail } from '@sveltejs/kit'
import { isInvoiceStatus } from '$lib/fmt'
import { DB_ERROR, num, str } from '$lib/server/form'
import {
	checkoutAction,
	createInvoice,
	deleteInvoice,
	getFreelancerInvoices,
	getInvoiceProjects,
	setInvoiceStatus,
} from '$lib/server/invoices'
import { isProjectClient, isProjectOwner } from '$lib/server/projects'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) error(401)
	const userId = locals.user.userId

	const [invoices, projects] = await Promise.all([
		getFreelancerInvoices(userId),
		getInvoiceProjects(userId),
	])

	return { invoices, projects }
}

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

		if (!(await isProjectOwner(project_id, locals.user.userId)))
			return fail(400, { error: 'Project not found in your workspace' })
		if (!(await isProjectClient(project_id, client_id)))
			return fail(400, { error: 'Client is not linked to this project' })

		try {
			await createInvoice({
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

	checkout: checkoutAction,

	update_status: async ({ locals, request }) => {
		if (!locals.user) error(401)
		const form = await request.formData()
		const id = str(form, 'id')
		const status = str(form, 'status')
		if (!isInvoiceStatus(status)) return fail(400, { error: 'Invalid status' })
		await setInvoiceStatus(id, locals.user.userId, status)
	},

	delete: async ({ locals, request }) => {
		if (!locals.user) error(401)
		const id = str(await request.formData(), 'id')
		await deleteInvoice(id, locals.user.userId)
	},
}
