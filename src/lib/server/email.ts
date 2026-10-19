import { env } from '$env/dynamic/private'

const DEFAULT_FROM = 'Portlane <onboarding@resend.dev>'

/** True when a real Resend key is configured (the test placeholder never sends). */
export function emailEnabled(): boolean {
	const key = env.RESEND_API_KEY
	return !!key && !key.startsWith('re_test')
}

function fromAddress(): string {
	return env.EMAIL_FROM ?? DEFAULT_FROM
}

export interface Email {
	to: string
	subject: string
	html: string
}

/**
 * Sends a transactional email through Resend. Returns `true` on success; when
 * email isn't configured (or sending fails) it logs and returns `false` instead
 * of throwing, so callers can treat notifications as best-effort.
 */
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
	const { Resend } = await import('resend')
	const resend = new Resend(env.RESEND_API_KEY)
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

/** Minimal HTML escaping for values interpolated into email bodies. */
export function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;')
}
