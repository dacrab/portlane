import { requireCron } from '#lib/server/cron.js'
import * as schema from '#lib/server/db/schema.js'
import { useDb } from '#lib/server/db.js'
import { deleteObjects, listObjects } from '#lib/server/storage.js'
import { findOrphanObjects } from '#lib/server/storage-sweep.js'
import type { RequestHandler } from './$types'

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
	await deleteObjects(orphans.map((o) => o.key))

	const summary = {
		scanned: rows.length,
		orphans: orphans.length,
		deleted: orphans.length,
	}
	// biome-ignore lint/suspicious/noConsole: cron diagnostics belong in server logs
	console.log('[storage-sweep]', summary)
	return Response.json(summary)
}
