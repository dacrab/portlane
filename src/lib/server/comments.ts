import { and, desc, eq, gt, ne } from 'drizzle-orm'
import * as schema from '#lib/server/db/schema.js'
import { useDb } from '#lib/server/db.js'

export interface ProjectComment {
	id: string
	body: string
	createdAt: string
	authorName: string
	projectId: string
	projectName: string
}

function baseQuery() {
	return useDb()
		.select({
			id: schema.comments.id,
			body: schema.comments.body,
			createdAt: schema.comments.createdAt,
			authorName: schema.users.name,
			projectId: schema.projects.id,
			projectName: schema.projects.name,
		})
		.from(schema.comments)
		.innerJoin(
			schema.projects,
			eq(schema.projects.id, schema.comments.projectId),
		)
		.innerJoin(schema.users, eq(schema.users.id, schema.comments.authorId))
}

export async function getUnreadComments(
	freelancerId: string,
): Promise<ProjectComment[]> {
	const db = useDb()
	const [me] = await db
		.select({ lastRead: schema.users.lastReadCommentsAt })
		.from(schema.users)
		.where(eq(schema.users.id, freelancerId))
		.limit(1)

	const conditions = [
		eq(schema.projects.freelancerId, freelancerId),
		ne(schema.comments.authorId, freelancerId),
	]
	if (me?.lastRead) conditions.push(gt(schema.comments.createdAt, me.lastRead))

	return baseQuery()
		.where(and(...conditions))
		.orderBy(desc(schema.comments.createdAt))
}

export function getRecentComments(
	freelancerId: string,
	limit = 5,
): Promise<ProjectComment[]> {
	return baseQuery()
		.where(eq(schema.projects.freelancerId, freelancerId))
		.orderBy(desc(schema.comments.createdAt))
		.limit(limit)
}

export async function markCommentsRead(freelancerId: string) {
	await useDb()
		.update(schema.users)
		.set({ lastReadCommentsAt: new Date().toISOString() })
		.where(eq(schema.users.id, freelancerId))
}
