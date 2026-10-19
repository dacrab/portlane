import { DEFAULT_CURRENCY } from '#lib/constants.js'

export interface InvoiceLineItemInput {
	amountCents: number
	currency?: string
	projectName?: string | null
}

export function buildInvoiceLineItems(invoice: InvoiceLineItemInput) {
	return [
		{
			price_data: {
				currency: invoice.currency ?? DEFAULT_CURRENCY,
				product_data: {
					name: invoice.projectName ?? 'Invoice payment',
				},
				unit_amount: invoice.amountCents,
			},
			quantity: 1,
		},
	]
}
