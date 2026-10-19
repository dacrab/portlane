import { defineEnvVars } from '@sveltejs/kit/env'

// These keep the previous `$env/dynamic/*` behaviour: missing values fall back to an empty string.
export const variables = defineEnvVars({
	STRIPE_WEBHOOK_SECRET: { schema: (input) => input ?? '' },
	STRIPE_SECRET_KEY: { schema: (input) => input ?? '' },
	CRON_SECRET: { schema: (input) => input ?? '' },
	PUBLIC_APP_URL: { public: true, static: true },
	BETTER_AUTH_SECRET: { schema: (input) => input ?? '' },
	RESEND_API_KEY: { schema: (input) => input ?? '' },
	EMAIL_FROM: { schema: (input) => input ?? '' },
	DATABASE_URL: { schema: (input) => input ?? '' },
	AWS_ACCESS_KEY_ID: { schema: (input) => input ?? '' },
	AWS_SECRET_ACCESS_KEY: { schema: (input) => input ?? '' },
	AWS_ENDPOINT_URL_S3: { schema: (input) => input ?? '' },
	AWS_REGION: { schema: (input) => input ?? '' },
	S3_BUCKET: { schema: (input) => input ?? '' },
})
