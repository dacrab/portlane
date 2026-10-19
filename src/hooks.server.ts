import type { Handle, HandleServerError } from '@sveltejs/kit'
import { svelteKitHandler } from 'better-auth/svelte-kit'
import { building } from '$app/environment'
import { PUBLIC_APP_URL } from '$env/static/public'
import { getAuth } from '$lib/server/auth'
import { assertServerEnv } from '$lib/server/env'

export const handle: Handle = async ({ event, resolve }) => {
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
	}

	const response = await svelteKitHandler({ event, resolve, auth, building })

	// Baseline hardening. A Content-Security-Policy is deliberately omitted:
	// SvelteKit's inline hydration script needs nonce plumbing, and a wrong CSP
	// breaks the app outright.
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

// Unexpected errors are logged server-side and never leaked to the client.
// Expected errors (from `error(...)`) keep their original message and status.
export const handleError: HandleServerError = ({ error, status }) => {
	if (status >= 500) {
		// biome-ignore lint/suspicious/noConsole: server errors must reach the logs
		console.error('[server-error]', error)
		return { message: 'Something went wrong. Please try again.' }
	}
}
