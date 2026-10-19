import { createHash, timingSafeEqual } from 'node:crypto'
import { CRON_SECRET } from '$app/env/private'

function secretMatches(presented: string | null, secret: string): boolean {
	if (!presented) return false
	const a = createHash('sha256').update(presented).digest()
	const b = createHash('sha256').update(secret).digest()
	return timingSafeEqual(a, b)
}

export function requireCron(request: Request): Response | null {
	const secret = CRON_SECRET
	if (!secret) {
		// biome-ignore lint/suspicious/noConsole: cron misconfiguration belongs in server logs
		console.error('[cron] CRON_SECRET is not configured')
		return Response.json({ error: 'Cron not configured' }, { status: 500 })
	}
	const presented =
		request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? null
	if (!secretMatches(presented, secret)) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 })
	}
	return null
}
