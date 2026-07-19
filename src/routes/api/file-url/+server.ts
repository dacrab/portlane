import { error, json } from '@sveltejs/kit'
import { and, eq } from 'drizzle-orm'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) error(401)

	const path = url.searchParams.get('path')
	if (!path) error(400, 'Missing path')

	const projectId = path.split('/')[0]
	if (!projectId) error(400, 'Invalid path')

	const db = useDb()
	const [access] = await db
		.select({ one: schema.projectClients.projectId })
		.from(schema.projectClients)
		.where(
			and(
				eq(schema.projectClients.projectId, projectId),
				eq(schema.projectClients.clientId, locals.user.userId),
			),
		)
		.limit(1)

	const [owned] = await db
		.select({ one: schema.projects.id })
		.from(schema.projects)
		.where(
			and(
				eq(schema.projects.id, projectId),
				eq(schema.projects.freelancerId, locals.user.userId),
			),
		)
		.limit(1)

	if (!access && !owned) error(403, 'Forbidden')

	return json({ url: path })
}
