import { dev } from '$app/env'
import {
	AWS_ACCESS_KEY_ID,
	AWS_ENDPOINT_URL_S3,
	AWS_REGION,
	AWS_SECRET_ACCESS_KEY,
	BETTER_AUTH_SECRET,
	DATABASE_URL,
	EMAIL_FROM,
	RESEND_API_KEY,
	S3_BUCKET,
	STRIPE_SECRET_KEY,
	STRIPE_WEBHOOK_SECRET,
} from '$app/env/private'
import { PUBLIC_APP_URL } from '$app/env/public'

const MIN_AUTH_SECRET_LENGTH = 32

let checked = false

function invalid(message: string): never {
	throw new Error(`${message} See .env.example, or configure it in Doppler.`)
}

export function assertServerEnv(): void {
	if (checked) return

	const required: Record<string, string> = {
		DATABASE_URL,
		BETTER_AUTH_SECRET,
		PUBLIC_APP_URL,
		STRIPE_SECRET_KEY,
		STRIPE_WEBHOOK_SECRET,
		AWS_ACCESS_KEY_ID,
		AWS_SECRET_ACCESS_KEY,
		AWS_ENDPOINT_URL_S3,
		AWS_REGION,
		S3_BUCKET,
	}

	if (!dev) {
		required.RESEND_API_KEY = RESEND_API_KEY
		required.EMAIL_FROM = EMAIL_FROM
	}

	const missing = Object.entries(required)
		.filter(([, value]) => !value)
		.map(([name]) => name)
	if (missing.length) {
		invalid(`Missing required environment variable(s): ${missing.join(', ')}.`)
	}

	if (BETTER_AUTH_SECRET.length < MIN_AUTH_SECRET_LENGTH) {
		invalid(
			`BETTER_AUTH_SECRET must be at least ${MIN_AUTH_SECRET_LENGTH} characters.`,
		)
	}

	let appUrl: URL
	try {
		appUrl = new URL(PUBLIC_APP_URL)
	} catch {
		invalid('PUBLIC_APP_URL must be an absolute URL.')
	}
	if (appUrl.protocol !== 'http:' && appUrl.protocol !== 'https:') {
		invalid('PUBLIC_APP_URL must use http or https.')
	}
	if (!dev && appUrl.protocol !== 'https:') {
		invalid('PUBLIC_APP_URL must use https in production.')
	}
	if (!dev && EMAIL_FROM.includes('resend.dev')) {
		invalid(
			'EMAIL_FROM still uses Resend’s test sender. Verify a domain and set EMAIL_FROM before deploying.',
		)
	}

	checked = true
}
