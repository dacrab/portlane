import { describe, expect, it } from 'vitest'
import { buildInvoiceLineItems } from './stripe'

describe('buildInvoiceLineItems', () => {
	it('creates a single line item from an invoice', () => {
		const items = buildInvoiceLineItems({
			amount_cents: 5000,
			currency: 'usd',
			project_name: 'Website redesign',
		})
		expect(items).toHaveLength(1)
		expect(items[0]?.price_data?.unit_amount).toBe(5000)
		expect(items[0]?.price_data?.currency).toBe('usd')
		expect(items[0]?.price_data?.product_data?.name).toBe('Website redesign')
		expect(items[0]?.quantity).toBe(1)
	})

	it('defaults currency to usd and uses fallback name', () => {
		const items = buildInvoiceLineItems({ amount_cents: 1000 })
		expect(items[0]?.price_data?.currency).toBe('usd')
		expect(items[0]?.price_data?.product_data?.name).toBe('Invoice payment')
	})
})
