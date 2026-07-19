import { createAuthClient } from 'better-auth/svelte'
import { PUBLIC_APP_URL } from '$env/static/public'

export const authClient = createAuthClient({
	baseURL: PUBLIC_APP_URL,
})
