import { fail } from '@sveltejs/kit'
import { and, desc, eq, getTableColumns, max, ne, sql } from 'drizzle-orm'
import { MAX_FILE_SIZE } from '#lib/constants.js'
import { sendPasswordSetupEmail } from '#lib/server/auth.js'
import type { UserRole } from '#lib/server/db/schema.js'
import * as schema from '#lib/server/db/schema.js'
import { useDb } from '#lib/server/db.js'
import { DB_ERROR, formFile } from '#lib/server/form.js'
import { deleteObjects, putObject } from '#lib/server/storage.js'

export async function isProjectOwner(projectId: string, userId: string) {
	const db = useDb()
	const [row] = await db
		.select({ id: schema.projects.id })
		.from(schema.projects)
		.where(
			and(
				eq(schema.projects.id, projectId),
				eq(schema.projects.freelancerId, userId),
			),
		)
		.limit(1)
	return !!row
}

export async function isProjectClient(projectId: string, userId: string) {
	const db = useDb()
	const [row] = await db
		.select({ projectId: schema.projectClients.projectId })
		.from(schema.projectClients)
		.where(
			and(
				eq(schema.projectClients.projectId, projectId),
				eq(schema.projectClients.clientId, userId),
			),
		)
		.limit(1)
	return !!row
}

export async function getDashboardProjects(freelancerId: string) {
	const db = useDb()
	return db
		.select({
			id: schema.projects.id,
			name: schema.projects.name,
			status: schema.projects.status,
			dueDate: schema.projects.dueDate,
		})
		.from(schema.projects)
		.where(
			and(
				eq(schema.projects.freelancerId, freelancerId),
				ne(schema.projects.status, 'archived'),
			),
		)
		.orderBy(desc(schema.projects.createdAt))
}

export async function getProjectList(freelancerId: string) {
	const db = useDb()
	return db
		.select({
			id: schema.projects.id,
			freelancerId: schema.projects.freelancerId,
			name: schema.projects.name,
			description: schema.projects.description,
			status: schema.projects.status,
			dueDate: schema.projects.dueDate,
			createdAt: schema.projects.createdAt,
			completedMilestones: sql<number>`(SELECT COUNT(*) FROM milestone WHERE project_id = ${schema.projects.id} AND completed = true)::int`,
			totalMilestones: sql<number>`(SELECT COUNT(*) FROM milestone WHERE project_id = ${schema.projects.id})::int`,
			clientCount: sql<number>`(SELECT COUNT(*) FROM project_client WHERE project_id = ${schema.projects.id})::int`,
		})
		.from(schema.projects)
		.where(eq(schema.projects.freelancerId, freelancerId))
		.orderBy(desc(schema.projects.createdAt))
}

export async function getProjectForOwner(
	projectId: string,
	freelancerId: string,
) {
	const db = useDb()
	const [project] = await db
		.select()
		.from(schema.projects)
		.where(
			and(
				eq(schema.projects.id, projectId),
				eq(schema.projects.freelancerId, freelancerId),
			),
		)
		.limit(1)
	return project ?? null
}

export async function getFreelancerClients(freelancerId: string) {
	const db = useDb()
	const rows = await db
		.select({
			id: schema.projectClients.clientId,
			name: schema.users.name,
			projectName: schema.projects.name,
		})
		.from(schema.projectClients)
		.innerJoin(
			schema.projects,
			eq(schema.projects.id, schema.projectClients.projectId),
		)
		.innerJoin(
			schema.users,
			eq(schema.users.id, schema.projectClients.clientId),
		)
		.where(eq(schema.projects.freelancerId, freelancerId))
		.orderBy(schema.users.name, schema.projects.name)

	const clients = new Map<
		string,
		{ id: string; name: string; projects: string[] }
	>()
	for (const row of rows) {
		const client = clients.get(row.id) ?? {
			id: row.id,
			name: row.name,
			projects: [],
		}
		client.projects.push(row.projectName)
		clients.set(row.id, client)
	}
	return [...clients.values()]
}

export async function getProjectsForClient(clientId: string) {
	const db = useDb()
	return db
		.select({
			id: schema.projects.id,
			name: schema.projects.name,
			status: schema.projects.status,
			dueDate: schema.projects.dueDate,
			freelancerName: schema.users.name,
		})
		.from(schema.projectClients)
		.innerJoin(
			schema.projects,
			eq(schema.projects.id, schema.projectClients.projectId),
		)
		.innerJoin(schema.users, eq(schema.users.id, schema.projects.freelancerId))
		.where(eq(schema.projectClients.clientId, clientId))
}

export async function getProjectWithFreelancer(projectId: string) {
	const db = useDb()
	const [project] = await db
		.select({
			...getTableColumns(schema.projects),
			freelancerName: schema.users.name,
		})
		.from(schema.projects)
		.innerJoin(schema.users, eq(schema.users.id, schema.projects.freelancerId))
		.where(eq(schema.projects.id, projectId))
		.limit(1)
	return project ?? null
}

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
		.orderBy(desc(schema.files.createdAt))
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
		createdAt: r.comment.createdAt,
		authorId: r.comment.authorId,
		name: r.user.name,
	}))
}

export async function getProjectTimeEntries(projectId: string) {
	const db = useDb()
	return db
		.select()
		.from(schema.timeEntries)
		.where(eq(schema.timeEntries.projectId, projectId))
		.orderBy(desc(schema.timeEntries.loggedAt))
}

export async function getProjectNote(projectId: string) {
	const db = useDb()
	const [row] = await db
		.select({ body: schema.projectNotes.body })
		.from(schema.projectNotes)
		.where(eq(schema.projectNotes.projectId, projectId))
		.limit(1)
	return row?.body ?? ''
}

export async function getProjectClients(projectId: string) {
	const db = useDb()
	return db
		.select({ id: schema.users.id, name: schema.users.name })
		.from(schema.projectClients)
		.innerJoin(
			schema.users,
			eq(schema.users.id, schema.projectClients.clientId),
		)
		.where(eq(schema.projectClients.projectId, projectId))
}

export async function createProject(input: {
	name: string
	description: string | null
	dueDate: string | null
	status: string
	freelancerId: string
}) {
	const db = useDb()
	const [project] = await db
		.insert(schema.projects)
		.values(input)
		.returning({ id: schema.projects.id })
	if (!project) throw new Error('Failed to create project')
	return project.id
}

export async function setProjectStatus(projectId: string, status: string) {
	await useDb()
		.update(schema.projects)
		.set({ status })
		.where(eq(schema.projects.id, projectId))
}

export async function deleteProject(projectId: string) {
	await useDb().delete(schema.projects).where(eq(schema.projects.id, projectId))
}

export async function addComment(
	projectId: string,
	authorId: string,
	body: string,
) {
	const db = useDb()
	await db.insert(schema.comments).values({ projectId, authorId, body })
}

export async function addMilestone(projectId: string, name: string) {
	const db = useDb()
	const [row] = await db
		.select({ highest: max(schema.milestones.position) })
		.from(schema.milestones)
		.where(eq(schema.milestones.projectId, projectId))

	await db.insert(schema.milestones).values({
		projectId,
		name,
		position: (row?.highest ?? -1) + 1,
	})
}

export async function toggleMilestone(
	projectId: string,
	milestoneId: string,
	completed: boolean,
) {
	await useDb()
		.update(schema.milestones)
		.set({ completed: !completed })
		.where(
			and(
				eq(schema.milestones.id, milestoneId),
				eq(schema.milestones.projectId, projectId),
			),
		)
}

export async function logTime(
	projectId: string,
	userId: string,
	minutes: number,
	description: string | null,
) {
	await useDb()
		.insert(schema.timeEntries)
		.values({ projectId, userId, minutes, description })
}

export async function saveProjectNote(projectId: string, body: string) {
	await useDb()
		.insert(schema.projectNotes)
		.values({ projectId, body })
		.onConflictDoUpdate({
			target: schema.projectNotes.projectId,
			set: { body },
		})
}

export async function removeProjectClient(projectId: string, clientId: string) {
	await useDb()
		.delete(schema.projectClients)
		.where(
			and(
				eq(schema.projectClients.projectId, projectId),
				eq(schema.projectClients.clientId, clientId),
			),
		)
}

export async function approveProject(
	projectId: string,
	authorId: string,
	note: string,
) {
	const db = useDb()
	await db.batch([
		db.insert(schema.comments).values({
			projectId,
			authorId,
			body: note ? `Approved - ${note}` : 'Approved',
		}),
		db
			.update(schema.projects)
			.set({ status: 'completed' })
			.where(eq(schema.projects.id, projectId)),
	])
}

export async function requestRevision(
	projectId: string,
	authorId: string,
	note: string,
) {
	const db = useDb()
	await db.batch([
		db.insert(schema.comments).values({
			projectId,
			authorId,
			body: note ? `Revision requested - ${note}` : 'Revision requested',
		}),
		db
			.update(schema.projects)
			.set({ status: 'review' })
			.where(eq(schema.projects.id, projectId)),
	])
}

const ALLOWED_MIME_PREFIXES = [
	'image/',
	'application/pdf',
	'application/zip',
	'application/x-zip-compressed',
	'text/',
]

const BLOCKED_MIME_TYPES = new Set([
	'image/svg+xml',
	'text/html',
	'text/xml',
	'text/javascript',
])

class FileUploadError extends Error {
	constructor(
		readonly code: 'too_large' | 'unsupported_type',
		message: string,
	) {
		super(message)
	}
}

async function uploadProjectFile(
	projectId: string,
	userId: string,
	file: File,
) {
	if (file.size > MAX_FILE_SIZE)
		throw new FileUploadError(
			'too_large',
			'File exceeds maximum size of 100 MB',
		)

	if (!file.type)
		throw new FileUploadError(
			'unsupported_type',
			'File type could not be determined',
		)

	const allowed = ALLOWED_MIME_PREFIXES.some((p) => file.type.startsWith(p))
	if (!allowed || BLOCKED_MIME_TYPES.has(file.type))
		throw new FileUploadError(
			'unsupported_type',
			`File type "${file.type}" is not supported`,
		)

	const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
	const key = `${projectId}/${crypto.randomUUID()}-${safeName}`

	const storagePath = await putObject(
		key,
		Buffer.from(await file.arrayBuffer()),
		file.type,
	)

	const db = useDb()
	await db.insert(schema.files).values({
		projectId,
		uploadedBy: userId,
		name: file.name,
		storagePath,
		sizeBytes: file.size,
	})
}

export async function handleUploadFileAction(
	projectId: string,
	userId: string,
	form: FormData,
) {
	const file = formFile(form, 'file')
	if (!file?.size) return fail(400, { error: 'No file provided' })
	try {
		await uploadProjectFile(projectId, userId, file)
	} catch (e) {
		if (e instanceof FileUploadError) {
			const status = e.code === 'too_large' ? 413 : 415
			return fail(status, { error: e.message })
		}
		return fail(500, { error: DB_ERROR })
	}
}

export async function deleteProjectFile(projectId: string, fileId: string) {
	const db = useDb()
	const [file] = await db
		.select({ storagePath: schema.files.storagePath })
		.from(schema.files)
		.where(
			and(eq(schema.files.id, fileId), eq(schema.files.projectId, projectId)),
		)
		.limit(1)

	if (!file) return false

	try {
		await deleteObjects([file.storagePath])
	} catch {}

	await db.delete(schema.files).where(eq(schema.files.id, fileId))
	return true
}

function nameFromEmail(email: string): string {
	const local = email.split('@')[0] ?? ''
	return (
		local
			.split(/[._-]+/)
			.filter(Boolean)
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ') || email
	)
}

export async function inviteClientByEmail(email: string, projectId: string) {
	const db = useDb()

	const [existing] = await db
		.select({ id: schema.users.id })
		.from(schema.users)
		.where(eq(schema.users.email, email))
		.limit(1)

	let clientId = existing?.id
	if (!clientId) {
		const [user] = await db
			.insert(schema.users)
			.values({
				email,
				name: nameFromEmail(email),
				role: 'client',
			})
			.returning({ id: schema.users.id })
		if (!user) throw new Error('Failed to create user')
		clientId = user.id
	}

	await db
		.insert(schema.projectClients)
		.values({ projectId, clientId })
		.onConflictDoNothing()

	if (await needsActivation(clientId)) {
		await sendPasswordSetupEmail(email)
	}
}

async function needsActivation(userId: string): Promise<boolean> {
	const [credential] = await useDb()
		.select({ id: schema.accounts.id })
		.from(schema.accounts)
		.where(
			and(
				eq(schema.accounts.userId, userId),
				eq(schema.accounts.providerId, 'credential'),
			),
		)
		.limit(1)
	return !credential
}

export const getHomeRoute = (role: UserRole | undefined) =>
	role === 'client' ? '/portal' : '/dashboard'
