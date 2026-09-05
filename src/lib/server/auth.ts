import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { sveltekitCookies } from 'better-auth/svelte-kit'
import { getRequestEvent } from '$app/server'
import { env } from '$env/dynamic/private'
import { PUBLIC_APP_URL } from '$env/static/public'
import { PASSWORD_MIN_LENGTH } from '$lib/constants'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'

export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET ?? '',
	baseURL: PUBLIC_APP_URL,
	database: drizzleAdapter(useDb(), {
		provider: 'pg',
		schema,
	}),
	emailAndPassword: {
		enabled: true,
		minPasswordLength: PASSWORD_MIN_LENGTH,
		sendResetPassword: async ({ user, url }) => {
			const apiKey = env.RESEND_API_KEY
			if (!apiKey || apiKey.startsWith('re_test')) {
				// biome-ignore lint/suspicious/noConsole: local dev logs the reset link instead of sending email
				console.info(`[reset-password] ${url}`)
				return
			}
			const { Resend } = await import('resend')
			const resend = new Resend(apiKey)
			const { error } = await resend.emails.send({
				from: env.EMAIL_FROM ?? 'Portlane <onboarding@resend.dev>',
				to: user.email,
				subject: 'Reset your Portlane password',
				html: `<p>Hi ${user.name},</p><p>Click the link below to reset your Portlane password:</p><p><a href="${url}">Reset your password</a></p><p>If you didn't request this, you can ignore this email.</p>`,
			})
			if (error) {
				// biome-ignore lint/suspicious/noConsole: email send failures surface in server logs without failing the request
				console.error('[reset-password] Failed to send reset email:', error)
			}
		},
	},
	plugins: [sveltekitCookies(getRequestEvent)],
})
