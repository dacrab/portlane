import { describe, expect, it } from 'vitest'
import {
	INVOICE_STATUS_ITEMS,
	INVOICE_STATUS_LABEL,
	INVOICE_STATUS_TONE,
	isInvoiceStatus,
	isProjectStatus,
	PROJECT_STATUS_ITEMS,
	PROJECT_STATUS_LABEL,
	PROJECT_STATUS_TONE,
} from './status'

describe('project status', () => {
	it('has a label and tone for every status', () => {
		for (const status of Object.keys(PROJECT_STATUS_LABEL)) {
			expect(status in PROJECT_STATUS_TONE).toBe(true)
		}
	})

	it('derives select items from the labels', () => {
		expect(PROJECT_STATUS_ITEMS).toEqual([
			{ value: 'planning', label: 'Planning' },
			{ value: 'in_progress', label: 'In progress' },
			{ value: 'review', label: 'In review' },
			{ value: 'completed', label: 'Completed' },
			{ value: 'archived', label: 'Archived' },
		])
	})

	it('validates statuses against their own domain', () => {
		expect(isProjectStatus('review')).toBe(true)
		expect(isProjectStatus('paid')).toBe(false)
	})
})

describe('invoice status', () => {
	it('has a label and tone for every status', () => {
		for (const status of Object.keys(INVOICE_STATUS_LABEL)) {
			expect(status in INVOICE_STATUS_TONE).toBe(true)
		}
	})

	it('lists the statuses in workflow order', () => {
		expect(INVOICE_STATUS_ITEMS.map((item) => item.value)).toEqual([
			'draft',
			'sent',
			'paid',
			'overdue',
		])
	})

	it('validates statuses against their own domain', () => {
		expect(isInvoiceStatus('overdue')).toBe(true)
		expect(isInvoiceStatus('archived')).toBe(false)
	})
})
