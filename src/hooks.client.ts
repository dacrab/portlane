import * as Sentry from '@sentry/sveltekit'
import { dev } from '$app/env'
import { PUBLIC_SENTRY_DSN } from '$app/env/public'

// Error monitoring is opt-in: with no DSN the SDK stays disabled, so local dev
// and CI behave exactly as before. Tracing is sampled low — errors are always
// captured, but a small app doesn't need 100% of its spans.
Sentry.init({
	dsn: PUBLIC_SENTRY_DSN || undefined,
	enabled: Boolean(PUBLIC_SENTRY_DSN),
	environment: dev ? 'development' : 'production',
	tracesSampleRate: 0.1,
})

export const handleError = Sentry.handleErrorWithSentry()
