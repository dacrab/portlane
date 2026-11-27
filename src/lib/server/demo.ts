import { DEMO_MODE } from '$app/env/private'

/**
 * Demo mode keeps the app usable without a verified email domain. It is on by
 * default; set DEMO_MODE=false for a deployment with real email delivery.
 */
export function isDemoMode(): boolean {
	const value = DEMO_MODE.trim().toLowerCase()
	return value !== '0' && value !== 'false'
}
