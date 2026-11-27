import { defineEnvVars } from '@sveltejs/kit/env'

const optional = { schema: (input?: string) => input ?? '' }

export const variables = defineEnvVars({
	STRIPE_WEBHOOK_SECRET: optional,
	STRIPE_SECRET_KEY: optional,
	CRON_SECRET: optional,
	PUBLIC_APP_URL: { public: true, static: true },
	BETTER_AUTH_SECRET: optional,
	RESEND_API_KEY: optional,
	EMAIL_FROM: optional,
	DEMO_MODE: optional,
	DATABASE_URL: optional,
	AWS_ACCESS_KEY_ID: optional,
	AWS_SECRET_ACCESS_KEY: optional,
	AWS_ENDPOINT_URL_S3: optional,
	AWS_REGION: optional,
	S3_BUCKET: optional,
	SENTRY_DSN: optional,
	PUBLIC_SENTRY_DSN: { ...optional, public: true, static: true },
})
