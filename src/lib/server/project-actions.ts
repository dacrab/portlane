import { fail } from '@sveltejs/kit'
import { and, eq, max } from 'drizzle-orm'
import { MAX_FILE_SIZE } from '#lib/constants.js'
import type { ProjectStatus } from '#lib/domain/status.js'
import { DB_ERROR } from '#lib/server/action.js'
import { sendPasswordSetupEmail } from '#lib/server/auth.js'
import * as schema from '#lib/server/db/schema.js'
import { useDb } from '#lib/server/db.js'
import { formFile } from '#lib/server/form.js'
import { deleteObjects, putObject } from '#lib/server/storage.js'

export async function createProject(input: {
	name: string
	description: string | null
	dueDate: string | null
	status: ProjectStatus
	freelancerId: string
}) {
	const [project] = await useDb()
		.insert(schema.projects)
		.values(input)
		.returning({ id: schema.projects.id })
	if (!project) throw new Error('Failed to create project')
	return project.id
}

export async function setProjectStatus(
	projectId: string,
	status: ProjectStatus,
) {
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
	await useDb().insert(schema.comments).values({ projectId, authorId, body })
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
			set: { body, updatedAt: new Date().toISOString() },
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
			body: note ? `Approved — ${note}` : 'Approved',
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
			body: note ? `Revision requested — ${note}` : 'Revision requested',
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

	await useDb().insert(schema.files).values({
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
				emailVerified: true,
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
