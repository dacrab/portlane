import { error } from '@sveltejs/kit'
import { and, eq, or } from 'drizzle-orm'
import * as schema from '#lib/server/db/schema.js'
import { useDb } from '#lib/server/db.js'
import { presignDownload } from '#lib/server/storage.js'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) error(401)

	const key = url.searchParams.get('path')
	if (!key) error(400, 'Missing path')

	// Object keys are namespaced by project: "<projectId>/<uuid>-<name>".
	const projectId = key.split('/')[0]
	if (!projectId) error(400, 'Invalid path')

	const db = useDb()
	const [allowed] = await db
		.select({ one: schema.projects.id })
		.from(schema.projects)
		.leftJoin(
			schema.projectClients,
			eq(schema.projectClients.projectId, schema.projects.id),
		)
		.where(
			and(
				eq(schema.projects.id, projectId),
				or(
					eq(schema.projects.freelancerId, locals.user.userId),
					eq(schema.projectClients.clientId, locals.user.userId),
				),
			),
		)
		.limit(1)

	if (!allowed) error(403, 'Forbidden')

	return Response.json({ url: await presignDownload(key) })
}
