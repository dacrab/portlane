import { EMAIL_FROM, RESEND_API_KEY } from '$app/env/private'

const DEFAULT_FROM = 'Portlane <onboarding@resend.dev>'

export function emailEnabled(): boolean {
	const key = RESEND_API_KEY
	return !!key && !key.startsWith('re_test')
}

function fromAddress(): string {
	return EMAIL_FROM || DEFAULT_FROM
}

let warnedAboutTestSender = false

function warnIfTestSender(): void {
	if (warnedAboutTestSender) return
	warnedAboutTestSender = true
	if (!fromAddress().includes('resend.dev')) return
	// biome-ignore lint/suspicious/noConsole: misconfiguration must be visible in server logs
	console.warn(
		`[email] EMAIL_FROM is "${fromAddress()}" — Resend's test sender only delivers to the account owner. Verify a domain and set EMAIL_FROM before launch.`,
	)
}

export interface Email {
	to: string
	subject: string
	html: string
}

export async function sendEmail({
	to,
	subject,
	html,
}: Email): Promise<boolean> {
	if (!emailEnabled()) {
		// biome-ignore lint/suspicious/noConsole: skipped notifications belong in server logs
		console.info(
			`[email] skipped (Resend not configured): to=${to} subject="${subject}"`,
		)
		return false
	}
	warnIfTestSender()
	const { Resend } = await import('resend')
	const resend = new Resend(RESEND_API_KEY)
	const { error } = await resend.emails.send({
		from: fromAddress(),
		to,
		subject,
		html,
	})
	if (error) {
		// biome-ignore lint/suspicious/noConsole: notification failures belong in server logs
		console.error(`[email] failed: to=${to} subject="${subject}"`, error)
		return false
	}
	return true
}

export function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;')
}
