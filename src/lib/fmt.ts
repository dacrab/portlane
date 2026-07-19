import { LOCALE } from '$lib/constants'

function formatDateSafe(
	iso: string,
	options: Intl.DateTimeFormatOptions,
): string {
	const d = new Date(iso)
	if (Number.isNaN(d.getTime())) return '-'
	return d.toLocaleDateString(LOCALE, options)
}

export const fmtMoney = (cents: number, currency = 'USD'): string => {
	const amount = cents / 100
	return amount.toLocaleString(LOCALE, {
		style: 'currency',
		currency,
		minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
	})
}

export const fmtDate = (iso: string): string =>
	formatDateSafe(iso, { month: 'short', day: 'numeric' })

export const fmtDateLong = (iso: string): string =>
	formatDateSafe(iso, { year: 'numeric', month: 'long', day: 'numeric' })

export const fmtDateTime = (iso: string): string =>
	formatDateSafe(iso, {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})

export const today = (): string => new Date().toISOString().split('T')[0] ?? ''

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
