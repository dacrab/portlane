import { fmtDateLong, fmtMoney } from '#lib/fmt.js'
import { requireCron } from '#lib/server/cron.js'
import { escapeHtml, sendEmail } from '#lib/server/email.js'
import {
	getInvoicesNeedingReminder,
	type InvoiceReminder,
	markInvoicesReminded,
	markOverdueInvoices,
} from '#lib/server/invoices.js'
import { PUBLIC_APP_URL } from '$app/env/public'
import type { RequestHandler } from './$types'

function reminderHtml(reminder: InvoiceReminder): string {
	const due = reminder.dueDate
		? ` — it was due on ${fmtDateLong(reminder.dueDate)}`
		: ''
	return `<p>Hi ${escapeHtml(reminder.clientName)},</p>
<p>This is a friendly reminder that the invoice for <strong>${escapeHtml(reminder.projectName)}</strong> (${fmtMoney(reminder.amountCents, reminder.currency)}) is still unpaid${due}.</p>
<p><a href="${PUBLIC_APP_URL}/portal">View and pay in your portal</a></p>
<p>Thanks,<br>${escapeHtml(reminder.freelancerName)}</p>`
}

export const GET: RequestHandler = async ({ request }) => {
	const denied = requireCron(request)
	if (denied) return denied

	const now = new Date()
	const overdue = await markOverdueInvoices(now.toISOString().slice(0, 10))
	const candidates = await getInvoicesNeedingReminder(now)

	const reminded: string[] = []
	for (const candidate of candidates) {
		const sent = await sendEmail({
			to: candidate.clientEmail,
			subject: `Payment reminder: ${candidate.projectName}`,
			html: reminderHtml(candidate),
		})
		if (sent) reminded.push(candidate.invoiceId)
	}
	await markInvoicesReminded(reminded, now)

	const summary = {
		overdue,
		candidates: candidates.length,
		reminded: reminded.length,
	}
	// biome-ignore lint/suspicious/noConsole: cron diagnostics belong in server logs
	console.log('[invoice-reminders]', summary)
	return Response.json(summary)
}
