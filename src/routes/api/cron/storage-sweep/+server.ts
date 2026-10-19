import { createHash, timingSafeEqual } from 'node:crypto'
import { json } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { deleteObjects, listObjects } from '$lib/server/storage'
import { findOrphanObjects } from '$lib/server/storage-sweep'
import type { RequestHandler } from './$types'

const DELETE_BATCH_SIZE = 1000

function secretMatches(presented: string | null, secret: string): boolean {
	if (!presented) return false
	const a = createHash('sha256').update(presented).digest()
	const b = createHash('sha256').update(secret).digest()
	return timingSafeEqual(a, b)
}

export const GET: RequestHandler = async ({ request }) => {
	const secret = env.CRON_SECRET
	if (!secret) {
		// biome-ignore lint/suspicious/noConsole: cron diagnostics belong in server logs
		console.error('[storage-sweep] CRON_SECRET is not configured')
		return json({ error: 'Cron not configured' }, { status: 500 })
	}
	const auth = request.headers.get('authorization')
	if (!secretMatches(auth?.replace(/^Bearer\s+/i, '') ?? null, secret)) {
		return json({ error: 'Unauthorized' }, { status: 401 })
	}

	const db = useDb()
	const rows = await db
		.select({ storagePath: schema.files.storagePath })
		.from(schema.files)

	const orphans = findOrphanObjects(
		await listObjects(),
		rows.map((r) => r.storagePath),
		new Date(),
	)

	let deleted = 0
	for (let i = 0; i < orphans.length; i += DELETE_BATCH_SIZE) {
		const batch = orphans.slice(i, i + DELETE_BATCH_SIZE)
		await deleteObjects(batch.map((o) => o.key))
		deleted += batch.length
	}

	const summary = { scanned: rows.length, orphans: orphans.length, deleted }
	// biome-ignore lint/suspicious/noConsole: cron diagnostics belong in server logs
	console.log('[storage-sweep]', summary)
	return json(summary)
}
