function formatDateSafe(
	iso: string,
	options: Intl.DateTimeFormatOptions,
): string {
	const d = new Date(iso)
	if (Number.isNaN(d.getTime())) return '-'
	return d.toLocaleDateString('en-US', options)
}

/** Format cents to display string e.g. "$3,200" or "$3,200.50" */
export const fmtMoney = (cents: number, currency = 'USD'): string => {
	const amount = cents / 100
	return amount.toLocaleString('en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
	})
}

/** Format date to short form e.g. "Jun 3" */
export const fmtDate = (iso: string): string =>
	formatDateSafe(iso, { month: 'short', day: 'numeric' })

/** Format date to long form e.g. "June 3, 2026" */
export const fmtDateLong = (iso: string): string =>
	formatDateSafe(iso, { year: 'numeric', month: 'long', day: 'numeric' })

/** Format date+time e.g. "Jun 3, 2:30 PM" */
export const fmtDateTime = (iso: string): string =>
	formatDateSafe(iso, {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})

/** Today's ISO date string for overdue comparisons */
export const today = (): string => new Date().toISOString().split('T')[0] ?? ''

const projectStatuses = [
	'planning',
	'in_progress',
	'review',
	'completed',
	'archived',
] as const

const invoiceStatuses = ['draft', 'sent', 'paid', 'overdue'] as const

/** Status → badge CSS class */
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

/** Status → human label */
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

/** Status options derived from {@link statusLabel} to avoid drift. */
export const PROJECT_STATUS_ITEMS = projectStatuses.map((s) => ({
	value: s,
	label: statusLabel[s] ?? s,
}))

export const INVOICE_STATUS_ITEMS = invoiceStatuses.map((s) => ({
	value: s,
	label: statusLabel[s] ?? s,
}))
