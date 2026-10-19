import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { sveltekitCookies } from 'better-auth/svelte-kit'
import { PASSWORD_MIN_LENGTH } from '#lib/constants.js'
import * as schema from '#lib/server/db/schema.js'
import { useDb } from '#lib/server/db.js'
import { emailEnabled, escapeHtml, sendEmail } from '#lib/server/email.js'
import { BETTER_AUTH_SECRET } from '$app/env/private'
import { PUBLIC_APP_URL } from '$app/env/public'
import { getRequestEvent } from '$app/server'

function createAuth() {
	const secret = BETTER_AUTH_SECRET
	if (!secret) throw new Error('BETTER_AUTH_SECRET is not configured')

	return betterAuth({
		secret,
		baseURL: PUBLIC_APP_URL,
		database: drizzleAdapter(useDb(), {
			provider: 'pg',
			schema,
			usePlural: true,
		}),
		user: {
			additionalFields: {
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

let auth: ReturnType<typeof createAuth> | null = null

export function getAuth(): ReturnType<typeof createAuth> {
	if (!auth) auth = createAuth()
	return auth
}

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
