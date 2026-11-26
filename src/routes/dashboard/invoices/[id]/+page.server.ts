import { error } from '@sveltejs/kit'
import { requireUser } from '#lib/server/guard.js'
import { getInvoiceById } from '#lib/server/invoices.js'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = requireUser(locals)

	const invoice = await getInvoiceById(params.id)
	if (!invoice) error(404, 'Invoice not found')
	if (invoice.freelancerId !== user.userId) error(403, 'Forbidden')

	return { invoice }
}
