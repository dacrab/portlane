import { describe, expect, it } from 'vitest'
import {
	fmtDate,
	fmtDateLong,
	fmtDateTime,
	fmtMoney,
	INVOICE_STATUS_ITEMS,
	PROJECT_STATUS_ITEMS,
	statusBadge,
	statusLabel,
} from './fmt'

describe('fmtMoney', () => {
	it('formats whole-dollar cents without decimals', () => {
		expect(fmtMoney(320000)).toBe('$3,200')
	})

	it('keeps two decimals when cents are present', () => {
		expect(fmtMoney(320050)).toBe('$3,200.50')
	})

	it('supports a custom currency', () => {
		expect(fmtMoney(1050, 'EUR')).toBe('€10.50')
	})
})

describe('date formatting', () => {
	it('formats a short date', () => {
		expect(fmtDate('2026-06-03')).toBe('Jun 3')
	})

	it('formats a long date', () => {
		expect(fmtDateLong('2026-06-03')).toBe('June 3, 2026')
	})

	it('formats date and time', () => {
		expect(fmtDateTime('2026-06-03T14:30:00')).toBe('Jun 3, 02:30 PM')
	})
})

describe('status maps', () => {
	it('maps invoice/planning status to badge classes', () => {
		expect(statusBadge.paid).toBe('badge badge-green')
		expect(statusBadge.overdue).toBe('badge badge-red')
		expect(statusBadge.planning).toBe('badge badge-neutral')
	})

	it('maps status to a human label', () => {
		expect(statusLabel.in_progress).toBe('In Progress')
		expect(statusLabel.paid).toBe('Paid')
	})

	it('has a label for every badge key', () => {
		for (const key of Object.keys(statusBadge)) {
			expect(key in statusLabel).toBe(true)
		}
	})

	it('derives status item lists from the labels', () => {
		expect(PROJECT_STATUS_ITEMS).toEqual([
			{ value: 'planning', label: 'Planning' },
			{ value: 'in_progress', label: 'In Progress' },
			{ value: 'review', label: 'Review' },
			{ value: 'completed', label: 'Completed' },
			{ value: 'archived', label: 'Archived' },
		])
		expect(INVOICE_STATUS_ITEMS.map((i) => i.value)).toEqual([
			'draft',
			'sent',
			'paid',
			'overdue',
		])
	})
})
