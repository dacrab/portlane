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

async function sendAuthEmail(input: {
	to: string
	subject: string
	html: string
	url: string
}): Promise<void> {
	if (!emailEnabled()) {
		// biome-ignore lint/suspicious/noConsole: local dev prints the link instead of sending email
		console.info(`[auth-link] ${input.url}`)
		return
	}
	await sendEmail({ to: input.to, subject: input.subject, html: input.html })
}

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
			requireEmailVerification: true,
			revokeSessionsOnPasswordReset: true,
			sendResetPassword: async ({ user, url }) => {
				await sendAuthEmail({
					to: user.email,
					subject: 'Set your Portlane password',
					html: `<p>Hi ${escapeHtml(user.name)},</p><p>Use the link below to set (or reset) the password for your Portlane account:</p><p><a href="${escapeHtml(url)}">Set my password</a></p><p>If you didn't expect this, you can safely ignore this email.</p>`,
					url,
				})
			},
		},
		emailVerification: {
			sendOnSignUp: true,
			autoSignInAfterVerification: true,
			sendVerificationEmail: async ({ user, url }) => {
				await sendAuthEmail({
					to: user.email,
					subject: 'Verify your Portlane email',
					html: `<p>Hi ${escapeHtml(user.name)},</p><p>Confirm your email to finish setting up your Portlane account:</p><p><a href="${escapeHtml(url)}">Verify my email</a></p><p>If you didn't create this account, you can safely ignore this email.</p>`,
					url,
				})
			},
		},
		rateLimit: {
			enabled: true,
			storage: 'database',
			window: 60,
			max: 100,
			customRules: {
				'/sign-in/email': { window: 60, max: 10 },
				'/sign-up/email': { window: 60, max: 5 },
				'/request-password-reset': { window: 60, max: 5 },
				'/send-verification-email': { window: 60, max: 5 },
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
