import { error, json } from '@sveltejs/kit'
import { issueSignedToken, presignUrl } from '@vercel/blob'
import { and, eq, or } from 'drizzle-orm'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import type { RequestHandler } from './$types'

const LINK_TTL_MS = 5 * 60 * 1000

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) error(401)

	const path = url.searchParams.get('path')
	if (!path) error(400, 'Missing path')

	const projectId = path.split('/')[0]
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

	const validUntil = Date.now() + LINK_TTL_MS
	const token = await issueSignedToken({
		pathname: path,
		operations: ['get'],
		validUntil,
	})
	const { presignedUrl } = await presignUrl(token, {
		access: 'private',
		operation: 'get',
		pathname: path,
		validUntil,
	})

	return json({ url: presignedUrl })
}
