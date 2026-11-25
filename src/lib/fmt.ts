import { DEFAULT_CURRENCY, LOCALE } from '#lib/constants.js'

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

function parseDate(iso: string): Date {
	if (!DATE_ONLY.test(iso)) return new Date(iso)
	const [year, month, day] = iso.split('-')
	return new Date(Number(year), Number(month) - 1, Number(day))
}

function formatDateSafe(
	iso: string,
	options: Intl.DateTimeFormatOptions,
): string {
	const d = parseDate(iso)
	if (Number.isNaN(d.getTime())) return '-'
	return d.toLocaleDateString(LOCALE, options)
}

export const fmtMoney = (
	cents: number,
	currency = DEFAULT_CURRENCY,
): string => {
	const amount = cents / 100
	return amount.toLocaleString(LOCALE, {
		style: 'currency',
		currency,
		minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
	})
}

export const fmtDate = (iso: string): string =>
	formatDateSafe(iso, { month: 'short', day: 'numeric' })

export const fmtDateYear = (iso: string): string =>
	formatDateSafe(iso, { year: 'numeric', month: 'short', day: 'numeric' })

export const fmtDateLong = (iso: string): string =>
	formatDateSafe(iso, { year: 'numeric', month: 'long', day: 'numeric' })

export const fmtDateTime = (iso: string): string =>
	formatDateSafe(iso, {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const

export const fmtSize = (bytes: number | null): string => {
	if (!bytes) return '—'
	let value = bytes
	let unit = 0
	while (value >= 1024 && unit < SIZE_UNITS.length - 1) {
		value /= 1024
		unit++
	}
	return `${value.toFixed(unit === 0 ? 0 : 1)} ${SIZE_UNITS[unit]}`
}

export const today = (): string => {
	const d = new Date()
	const pad = (n: number) => String(n).padStart(2, '0')
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const projectStatuses = [
	'planning',
	'in_progress',
	'review',
	'completed',
	'archived',
] as const

const invoiceStatuses = ['draft', 'sent', 'paid', 'overdue'] as const

export const statusBadge: Record<string, string> = {
	draft: 'badge badge-neutral',
	sent: 'badge badge-blue',
	paid: 'badge badge-green',
	overdue: 'badge badge-red',
	planning: 'badge badge-neutral',
	in_progress: 'badge badge-accent',
	review: 'badge badge-yellow',
	completed: 'badge badge-green',
	archived: 'badge badge-neutral',
}

export const statusLabel: Record<string, string> = {
	draft: 'Draft',
	sent: 'Sent',
	paid: 'Paid',
	overdue: 'Overdue',
	in_progress: 'In Progress',
	review: 'Review',
	planning: 'Planning',
	completed: 'Completed',
	archived: 'Archived',
}

export const PROJECT_STATUS_ITEMS = projectStatuses.map((s) => ({
	value: s,
	label: statusLabel[s] ?? s,
}))

export const INVOICE_STATUS_ITEMS = invoiceStatuses.map((s) => ({
	value: s,
	label: statusLabel[s] ?? s,
}))

export const isProjectStatus = (value: string): boolean =>
	(projectStatuses as readonly string[]).includes(value)

export const isInvoiceStatus = (value: string): boolean =>
	(invoiceStatuses as readonly string[]).includes(value)
