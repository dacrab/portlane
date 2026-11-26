import { describe, expect, it, vi } from 'vitest'
import {
	formatDate,
	formatDateLong,
	formatDateTime,
	formatFileSize,
	formatMoney,
	todayISO,
} from './format'

describe('formatMoney', () => {
	it('formats whole-dollar cents without decimals', () => {
		expect(formatMoney(320000)).toBe('$3,200')
	})

	it('keeps two decimals when cents are present', () => {
		expect(formatMoney(320050)).toBe('$3,200.50')
	})

	it('supports a custom currency', () => {
		expect(formatMoney(1050, 'EUR')).toBe('€10.50')
	})
})

describe('formatFileSize', () => {
	it('formats bytes as megabytes with one decimal', () => {
		expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB')
	})

	it('formats smaller sizes with the right unit', () => {
		expect(formatFileSize(512)).toBe('512 B')
		expect(formatFileSize(1536)).toBe('1.5 KB')
	})

	it('returns an em dash when the size is unknown', () => {
		expect(formatFileSize(null)).toBe('—')
		expect(formatFileSize(0)).toBe('—')
	})
})

describe('date formatting', () => {
	it('formats a short date', () => {
		expect(formatDate('2026-06-03')).toBe('Jun 3')
	})

	it('formats a long date', () => {
		expect(formatDateLong('2026-06-03')).toBe('June 3, 2026')
	})

	it('formats date and time', () => {
		expect(formatDateTime('2026-06-03T14:30:00')).toBe('Jun 3, 02:30 PM')
	})
})

describe('todayISO', () => {
	it('returns the local calendar date, not the UTC one', () => {
		const now = new Date()
		now.setHours(23, 30, 0, 0)
		vi.setSystemTime(now)
		const pad = (n: number) => String(n).padStart(2, '0')
		expect(todayISO()).toBe(
			`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
		)
		vi.useRealTimers()
	})
})
