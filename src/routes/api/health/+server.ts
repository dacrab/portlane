import { sql } from 'drizzle-orm'
import { useDb } from '#lib/server/db.js'
import type { RequestHandler } from './$types'

// Liveness/readiness probe for uptime monitoring. Confirms the database is
// reachable; returns 503 when it isn't.
export const GET: RequestHandler = async () => {
	try {
		await useDb().execute(sql`select 1`)
		return Response.json({ ok: true })
	} catch {
		return Response.json({ ok: false }, { status: 503 })
	}
}
