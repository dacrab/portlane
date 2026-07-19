import { eq, sql } from 'drizzle-orm'
import { MAX_FILE_SIZE } from '$lib/constants'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'

export async function getProjectMilestones(projectId: string) {
	const db = useDb()
	return db
		.select()
		.from(schema.milestones)
		.where(eq(schema.milestones.projectId, projectId))
		.orderBy(schema.milestones.position)
}

export async function getProjectFiles(projectId: string) {
	const db = useDb()
	return db
		.select()
		.from(schema.files)
		.where(eq(schema.files.projectId, projectId))
		.orderBy(sql`${schema.files.createdAt} DESC`)
}

export async function getProjectComments(projectId: string) {
	const db = useDb()
	const rows = await db
		.select()
		.from(schema.comments)
		.innerJoin(schema.users, eq(schema.users.id, schema.comments.authorId))
		.where(eq(schema.comments.projectId, projectId))
		.orderBy(schema.comments.createdAt)
	return rows.map((r) => ({
		id: r.comment.id,
		body: r.comment.body,
		created_at: r.comment.createdAt,
		author_id: r.comment.authorId,
		name: r.user.name,
	}))
}

export async function addComment(
	projectId: string,
	authorId: string,
	body: string,
) {
	const db = useDb()
	await db.insert(schema.comments).values({
		projectId,
		authorId,
		body,
	})
}

const ALLOWED_MIME_PREFIXES = [
	'image/',
	'application/pdf',
	'application/zip',
	'application/x-zip-compressed',
	'text/',
]

export async function uploadProjectFile(
	projectId: string,
	userId: string,
	file: File,
) {
	if (file.size > MAX_FILE_SIZE)
		throw new Error('File exceeds maximum size of 100 MB')

	const allowed = ALLOWED_MIME_PREFIXES.some((p) => file.type.startsWith(p))
	if (!allowed && file.type !== '')
		throw new Error(`File type "${file.type}" is not supported`)

	const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
	const path = `${projectId}/${crypto.randomUUID()}-${safeName}`

	const { put } = await import('@vercel/blob')
	const blob = await put(path, file, { access: 'public' })

	const db = useDb()
	await db.insert(schema.files).values({
		projectId,
		uploadedBy: userId,
		name: file.name,
		storagePath: blob.url,
		sizeBytes: file.size,
	})
}

export async function inviteClientByEmail(email: string, projectId: string) {
	const db = useDb()

	const [user] = await db
		.insert(schema.users)
		.values({
			email,
			name: '',
			role: 'client',
		})
		.returning({ id: schema.users.id })

	if (!user) throw new Error('Failed to create user')

	await db.insert(schema.projectClients).values({
		projectId,
		clientId: user.id,
	})
}

export const getHomeRoute = (role: string | undefined) =>
	role === 'client' ? '/portal' : '/dashboard'
