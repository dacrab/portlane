import { error, json } from '@sveltejs/kit'
import {
	createInvoiceCheckoutSession,
	InvoiceCheckoutError,
} from '$lib/server/invoices'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ locals, params, url: reqUrl }) => {
	if (!locals.user) error(401)

	try {
		const result = await createInvoiceCheckoutSession(
			params.id,
			locals.user.userId,
			reqUrl.origin,
		)
		return json({ url: result.url })
	} catch (e) {
		if (e instanceof InvoiceCheckoutError)
			error(e.code === 'not_found' ? 404 : 400, e.message)
		throw e
	}
}
