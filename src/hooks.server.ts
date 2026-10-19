import * as Sentry from '@sentry/sveltekit'
import type { Handle, HandleServerError } from '@sveltejs/kit/hooks'
import { sequence } from '@sveltejs/kit/hooks'
import { svelteKitHandler } from 'better-auth/svelte-kit'
import { getAuth } from '#lib/server/auth.js'
import { assertServerEnv } from '#lib/server/env.js'
import { building, dev } from '$app/env'
import { SENTRY_DSN } from '$app/env/private'
import { PUBLIC_APP_URL } from '$app/env/public'

Sentry.init({
	dsn: SENTRY_DSN || undefined,
	enabled: Boolean(SENTRY_DSN),
	environment: dev ? 'development' : 'production',
	tracesSampleRate: 0.1,
})

const appHandle: Handle = async ({ event, resolve }) => {
	assertServerEnv()

	const auth = getAuth()
	const session = await auth.api.getSession({
		headers: event.request.headers,
	})

	if (session) {
		event.locals.user = {
			userId: session.user.id,
			email: session.user.email,
			role: session.user.role === 'client' ? 'client' : 'freelancer',
		}
		Sentry.setUser({ id: session.user.id, email: session.user.email })
	}

	const response = await svelteKitHandler({ event, resolve, auth, building })

	response.headers.set('X-Content-Type-Options', 'nosniff')
	response.headers.set('X-Frame-Options', 'DENY')
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
	response.headers.set(
		'Permissions-Policy',
		'camera=(), microphone=(), geolocation=()',
	)
	if (!building && PUBLIC_APP_URL.startsWith('https://')) {
		response.headers.set(
			'Strict-Transport-Security',
			'max-age=63072000; includeSubDomains; preload',
		)
	}

	return response
}

export const handle = sequence(Sentry.sentryHandle(), appHandle)

const appHandleError: HandleServerError = ({ kind, error }) => {
	if (kind === 'unknown') {
		// biome-ignore lint/suspicious/noConsole: server errors must reach the logs
		console.error('[server-error]', error)
		return { status: 500, message: 'Something went wrong. Please try again.' }
	}
	if (kind === 'framework' && error.status >= 500) {
		// biome-ignore lint/suspicious/noConsole: server errors must reach the logs
		console.error('[server-error]', error)
		return {
			status: error.status,
			message: 'Something went wrong. Please try again.',
		}
	}
}

export const handleError = Sentry.handleErrorWithSentry(appHandleError)
