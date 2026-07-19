interface InvoiceLineItemInput {
	amount_cents: number
	currency?: string
	project_name?: string | null
}

import { DEFAULT_CURRENCY } from '$lib/constants'

export function buildInvoiceLineItems(invoice: InvoiceLineItemInput) {
	return [
		{
			price_data: {
				currency: invoice.currency ?? DEFAULT_CURRENCY,
				product_data: {
					name: invoice.project_name ?? 'Invoice payment',
				},
				unit_amount: invoice.amount_cents,
			},
			quantity: 1,
		},
	]
}
