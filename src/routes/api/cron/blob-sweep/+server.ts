import { createHash, timingSafeEqual } from 'node:crypto'
import { json } from '@sveltejs/kit'
import { del, type ListBlobResultBlob, list } from '@vercel/blob'
import { env } from '$env/dynamic/private'
import { findOrphanBlobs } from '$lib/server/blob-sweep'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import type { RequestHandler } from './$types'

const DELETE_BATCH_SIZE = 100

function secretMatches(presented: string | null, secret: string): boolean {
	if (!presented) return false
	const a = createHash('sha256').update(presented).digest()
	const b = createHash('sha256').update(secret).digest()
	return timingSafeEqual(a, b)
}

async function listAllBlobs(): Promise<ListBlobResultBlob[]> {
	const all: ListBlobResultBlob[] = []
	let cursor: string | undefined
	do {
		const page = await list({ cursor })
		all.push(...page.blobs)
		cursor = page.hasMore ? page.cursor : undefined
	} while (cursor)
	return all
}

export const GET: RequestHandler = async ({ request }) => {
	const secret = env.CRON_SECRET
	if (!secret) {
		// biome-ignore lint/suspicious/noConsole: cron diagnostics belong in server logs
		console.error('[blob-sweep] CRON_SECRET is not configured')
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

	const orphans = findOrphanBlobs(
		await listAllBlobs(),
		rows.map((r) => r.storagePath),
		new Date(),
	)

	let deleted = 0
	for (let i = 0; i < orphans.length; i += DELETE_BATCH_SIZE) {
		const batch = orphans.slice(i, i + DELETE_BATCH_SIZE)
		await del(batch.map((b) => b.url))
		deleted += batch.length
	}

	const summary = { scanned: rows.length, orphans: orphans.length, deleted }
	// biome-ignore lint/suspicious/noConsole: cron diagnostics belong in server logs
	console.log('[blob-sweep]', summary)
	return json(summary)
}
