import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { sveltekitCookies } from 'better-auth/svelte-kit'
import { getRequestEvent } from '$app/server'
import { env } from '$env/dynamic/private'
import { PUBLIC_APP_URL } from '$env/static/public'
import { PASSWORD_MIN_LENGTH } from '$lib/constants'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { emailEnabled, escapeHtml, sendEmail } from '$lib/server/email'

function createAuth() {
	const secret = env.BETTER_AUTH_SECRET
	if (!secret) throw new Error('BETTER_AUTH_SECRET is not configured')

	return betterAuth({
		secret,
		baseURL: PUBLIC_APP_URL,
		database: drizzleAdapter(useDb(), {
			provider: 'pg',
			schema,
			// The schema is exported with plural names (users, sessions, ...);
			// without this the adapter looks for a singular `user` model and fails.
			usePlural: true,
		}),
		user: {
			additionalFields: {
				// Surfaced on `session.user` so request handling doesn't need a second
				// query. Not client-writable: the role is assigned server-side.
				role: {
					type: 'string',
					required: false,
					defaultValue: 'freelancer',
					input: false,
				},
			},
		},
		emailAndPassword: {
			enabled: true,
			minPasswordLength: PASSWORD_MIN_LENGTH,
			// Serves both "forgot password" and first-time client invites: either way
			// the recipient lands on the same set-password screen.
			sendResetPassword: async ({ user, url }) => {
				if (!emailEnabled()) {
					// biome-ignore lint/suspicious/noConsole: local dev logs the link instead of sending email
					console.info(`[password-link] ${url}`)
					return
				}
				await sendEmail({
					to: user.email,
					subject: 'Set your Portlane password',
					html: `<p>Hi ${escapeHtml(user.name)},</p><p>Use the link below to set (or reset) the password for your Portlane account:</p><p><a href="${escapeHtml(url)}">Set my password</a></p><p>If you didn't expect this, you can safely ignore this email.</p>`,
				})
			},
		},
		plugins: [sveltekitCookies(getRequestEvent)],
	})
}

// Built on first use rather than at import: the postbuild analysis step (and any
// other tooling) imports this module without runtime secrets configured.
let auth: ReturnType<typeof createAuth> | null = null

export function getAuth(): ReturnType<typeof createAuth> {
	if (!auth) auth = createAuth()
	return auth
}

/**
 * Emails a user a link to set (or reset) their password — used to activate a
 * freshly invited client, who exists without credentials until they do this.
 * Best-effort: returns false when email isn't configured or sending fails.
 */
export async function sendPasswordSetupEmail(email: string): Promise<boolean> {
	if (!emailEnabled()) {
		// biome-ignore lint/suspicious/noConsole: local dev cannot send, surface the skip
		console.info(`[password-link] skipped for ${email} (Resend not configured)`)
		return false
	}
	try {
		await getAuth().api.requestPasswordReset({
			body: { email, redirectTo: `${PUBLIC_APP_URL}/reset-password` },
		})
		return true
	} catch (err) {
		// biome-ignore lint/suspicious/noConsole: failures belong in server logs
		console.error(`[password-link] failed for ${email}`, err)
		return false
	}
}
