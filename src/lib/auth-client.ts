import { createAuthClient } from 'better-auth/svelte'
import { PUBLIC_APP_URL } from '$app/env/public'

export const authClient = createAuthClient({
	baseURL: PUBLIC_APP_URL,
})

/** Best-effort human message from a Better Auth client error. */
export function authError(
	error: { message?: string; statusText: string },
	fallback: string,
): string {
	return error.message || error.statusText || fallback
}
