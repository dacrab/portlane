export type Tone =
	| 'neutral'
	| 'accent'
	| 'success'
	| 'warning'
	| 'danger'
	| 'info'

const PROJECT_STATUSES = [
	'planning',
	'in_progress',
	'review',
	'completed',
	'archived',
] as const

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
	planning: 'Planning',
	in_progress: 'In progress',
	review: 'In review',
	completed: 'Completed',
	archived: 'Archived',
}

export const PROJECT_STATUS_TONE: Record<ProjectStatus, Tone> = {
	planning: 'neutral',
	in_progress: 'accent',
	review: 'warning',
	completed: 'success',
	archived: 'neutral',
}

export const PROJECT_STATUS_ITEMS = PROJECT_STATUSES.map((value) => ({
	value,
	label: PROJECT_STATUS_LABEL[value],
}))

const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue'] as const

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
	draft: 'Draft',
	sent: 'Sent',
	paid: 'Paid',
	overdue: 'Overdue',
}

export const INVOICE_STATUS_TONE: Record<InvoiceStatus, Tone> = {
	draft: 'neutral',
	sent: 'info',
	paid: 'success',
	overdue: 'danger',
}

export const INVOICE_STATUS_ITEMS = INVOICE_STATUSES.map((value) => ({
	value,
	label: INVOICE_STATUS_LABEL[value],
}))

export function isProjectStatus(value: string): value is ProjectStatus {
	return (PROJECT_STATUSES as readonly string[]).includes(value)
}

export function isInvoiceStatus(value: string): value is InvoiceStatus {
	return (INVOICE_STATUSES as readonly string[]).includes(value)
}
