import { json } from '@sveltejs/kit'
import { requireCron } from '$lib/server/cron'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { deleteObjects, listObjects } from '$lib/server/storage'
import { findOrphanObjects } from '$lib/server/storage-sweep'
import type { RequestHandler } from './$types'

const DELETE_BATCH_SIZE = 1000

export const GET: RequestHandler = async ({ request }) => {
	const denied = requireCron(request)
	if (denied) return denied

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
