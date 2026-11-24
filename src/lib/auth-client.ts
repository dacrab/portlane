import { createAuthClient } from 'better-auth/svelte'

export const authClient = createAuthClient()

export function authError(
	error: { message?: string; statusText: string },
	fallback: string,
): string {
	return error.message || error.statusText || fallback
}
