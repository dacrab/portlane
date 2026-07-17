interface InvoiceLineItemInput {
	amount_cents: number
	currency?: string
	project_name?: string | null
}

export function buildInvoiceLineItems(invoice: InvoiceLineItemInput) {
	return [
		{
			price_data: {
				currency: invoice.currency ?? 'usd',
				product_data: {
					name: invoice.project_name ?? 'Invoice payment',
				},
				unit_amount: invoice.amount_cents,
			},
			quantity: 1,
		},
	]
}
