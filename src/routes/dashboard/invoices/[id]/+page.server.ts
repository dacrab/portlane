import { error } from '@sveltejs/kit'
import { checkoutAction, getInvoiceById } from '#lib/server/invoices.js'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) error(401)

	const invoice = await getInvoiceById(params.id)
	if (!invoice) error(404, 'Invoice not found')

	if (
		invoice.freelancerId !== locals.user.userId &&
		invoice.clientId !== locals.user.userId
	) {
		error(403, 'Forbidden')
	}

	return { invoice, user: locals.user }
}

export const actions: Actions = {
	checkout: checkoutAction,
}
