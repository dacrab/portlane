import { DEFAULT_CURRENCY, LOCALE } from '#lib/constants.js'

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

function parseDate(value: string): Date {
	if (!DATE_ONLY.test(value)) return new Date(value)
	const [year, month, day] = value.split('-')
	return new Date(Number(year), Number(month) - 1, Number(day))
}

function formatDateSafe(
	value: string,
	options: Intl.DateTimeFormatOptions,
): string {
	const date = parseDate(value)
	if (Number.isNaN(date.getTime())) return '—'
	return date.toLocaleDateString(LOCALE, options)
}

export function formatMoney(
	cents: number,
	currency = DEFAULT_CURRENCY,
): string {
	const amount = cents / 100
	return amount.toLocaleString(LOCALE, {
		style: 'currency',
		currency,
		minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
	})
}

export function formatDate(value: string): string {
	return formatDateSafe(value, { month: 'short', day: 'numeric' })
}

export function formatDateYear(value: string): string {
	return formatDateSafe(value, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

export function formatDateLong(value: string): string {
	return formatDateSafe(value, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}

export function formatDateTime(value: string): string {
	return formatDateSafe(value, {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const

export function formatFileSize(bytes: number | null): string {
	if (!bytes) return '—'
	let value = bytes
	let unit = 0
	while (value >= 1024 && unit < SIZE_UNITS.length - 1) {
		value /= 1024
		unit++
	}
	return `${value.toFixed(unit === 0 ? 0 : 1)} ${SIZE_UNITS[unit]}`
}

export function todayISO(): string {
	const date = new Date()
	const pad = (value: number) => String(value).padStart(2, '0')
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
