import {
	AWS_ACCESS_KEY_ID,
	AWS_ENDPOINT_URL_S3,
	AWS_SECRET_ACCESS_KEY,
	BETTER_AUTH_SECRET,
	DATABASE_URL,
	S3_BUCKET,
	STRIPE_SECRET_KEY,
	STRIPE_WEBHOOK_SECRET,
} from '$app/env/private'
import { PUBLIC_APP_URL } from '$app/env/public'

let checked = false

/**
 * Fails fast, once, listing every missing variable the app cannot run without,
 * instead of letting a cryptic error surface mid-request. Optional integrations
 * (Resend, the cron secret) degrade gracefully and are validated where they're
 * used. Called from `handle`, so env is read at runtime — never at build time.
 */
export function assertServerEnv(): void {
	if (checked) return

	const required = {
		DATABASE_URL,
		BETTER_AUTH_SECRET,
		PUBLIC_APP_URL,
		STRIPE_SECRET_KEY,
		STRIPE_WEBHOOK_SECRET,
		AWS_ACCESS_KEY_ID,
		AWS_SECRET_ACCESS_KEY,
		AWS_ENDPOINT_URL_S3,
		S3_BUCKET,
	}

	const missing = Object.entries(required)
		.filter(([, value]) => !value)
		.map(([name]) => name)
	if (missing.length) {
		throw new Error(
			`Missing required environment variable(s): ${missing.join(', ')}. ` +
				'See .env.example, or configure them in Doppler.',
		)
	}

	checked = true
}
