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
	},
	plugins: [sveltekitCookies(getRequestEvent)],
})
