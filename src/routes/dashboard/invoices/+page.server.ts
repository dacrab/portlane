import { fail } from '@sveltejs/kit'
import { isInvoiceStatus } from '#lib/domain/status.js'
import { authed, DB_ERROR } from '#lib/server/action.js'
import { num, str } from '#lib/server/form.js'
import { requireUser } from '#lib/server/guard.js'
import {
	createInvoice,
	deleteInvoice,
	setInvoiceStatus,
} from '#lib/server/invoice-actions.js'
import {
	getFreelancerInvoices,
	getInvoiceProjects,
} from '#lib/server/invoices.js'
import { isProjectClient, isProjectOwner } from '#lib/server/projects.js'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals)

	const [invoices, projects] = await Promise.all([
		getFreelancerInvoices(user.userId),
		getInvoiceProjects(user.userId),
	])

	return { invoices, projects }
}

export const actions: Actions = {
	create: authed(async ({ user, form }) => {
		const projectId = str(form, 'project_id')
		const clientId = str(form, 'client_id')
		const amount = num(form, 'amount', Number.NaN)
		const dueDate = str(form, 'due_date') || null

		if (!(projectId && clientId) || Number.isNaN(amount))
			return fail(400, { error: 'Missing fields' })
		if (amount <= 0) return fail(400, { error: 'Amount must be positive' })
		if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate))
			return fail(400, { error: 'Invalid due date' })

		if (!(await isProjectOwner(projectId, user.userId)))
			return fail(400, { error: 'Project not found in your workspace' })
		if (!(await isProjectClient(projectId, clientId)))
			return fail(400, { error: 'Client is not linked to this project' })

		try {
			await createInvoice({
				projectId,
				clientId,
				freelancerId: user.userId,
				amountCents: Math.round(amount * 100),
				dueDate,
			})
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	}),

	update_status: authed(async ({ user, form }) => {
		const status = str(form, 'status')
		if (!isInvoiceStatus(status)) return fail(400, { error: 'Invalid status' })
		await setInvoiceStatus(str(form, 'id'), user.userId, status)
	}),

	delete: authed(async ({ user, form }) => {
		await deleteInvoice(str(form, 'id'), user.userId)
	}),
}
