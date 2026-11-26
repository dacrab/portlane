import { and, desc, eq, getTableColumns, ne, sql } from 'drizzle-orm'
import type {
	Milestone,
	ProjectClient,
	ProjectComment,
	ProjectFile,
	TimeEntry,
} from '#lib/domain/types.js'
import * as schema from '#lib/server/db/schema.js'
import { useDb } from '#lib/server/db.js'

export async function isProjectOwner(projectId: string, userId: string) {
	const [row] = await useDb()
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
	const [row] = await useDb()
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
	return useDb()
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
	return useDb()
		.select({
			id: schema.projects.id,
			name: schema.projects.name,
			description: schema.projects.description,
			status: schema.projects.status,
			dueDate: schema.projects.dueDate,
			createdAt: schema.projects.createdAt,
			completedMilestones: sql<number>`(SELECT COUNT(*) FROM milestone WHERE milestone.project_id = "project"."id" AND milestone.completed = true)::int`,
			totalMilestones: sql<number>`(SELECT COUNT(*) FROM milestone WHERE milestone.project_id = "project"."id")::int`,
			clientCount: sql<number>`(SELECT COUNT(*) FROM project_client WHERE project_client.project_id = "project"."id")::int`,
		})
		.from(schema.projects)
		.where(eq(schema.projects.freelancerId, freelancerId))
		.orderBy(desc(schema.projects.createdAt))
}

export async function getProjectForOwner(
	projectId: string,
	freelancerId: string,
) {
	const [project] = await useDb()
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
	const rows = await useDb()
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
	return useDb()
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
	const [project] = await useDb()
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

export async function getProjectMilestones(
	projectId: string,
): Promise<Milestone[]> {
	return useDb()
		.select({
			id: schema.milestones.id,
			projectId: schema.milestones.projectId,
			name: schema.milestones.name,
			completed: schema.milestones.completed,
			position: schema.milestones.position,
		})
		.from(schema.milestones)
		.where(eq(schema.milestones.projectId, projectId))
		.orderBy(schema.milestones.position)
}

export async function getProjectFiles(
	projectId: string,
): Promise<ProjectFile[]> {
	return useDb()
		.select({
			id: schema.files.id,
			name: schema.files.name,
			storagePath: schema.files.storagePath,
			sizeBytes: schema.files.sizeBytes,
			createdAt: schema.files.createdAt,
		})
		.from(schema.files)
		.where(eq(schema.files.projectId, projectId))
		.orderBy(desc(schema.files.createdAt))
}

export async function getProjectComments(
	projectId: string,
): Promise<ProjectComment[]> {
	const rows = await useDb()
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

export async function getProjectTimeEntries(
	projectId: string,
): Promise<TimeEntry[]> {
	return useDb()
		.select({
			id: schema.timeEntries.id,
			minutes: schema.timeEntries.minutes,
			description: schema.timeEntries.description,
			loggedAt: schema.timeEntries.loggedAt,
		})
		.from(schema.timeEntries)
		.where(eq(schema.timeEntries.projectId, projectId))
		.orderBy(desc(schema.timeEntries.loggedAt))
}

export async function getProjectNote(projectId: string) {
	const [row] = await useDb()
		.select({ body: schema.projectNotes.body })
		.from(schema.projectNotes)
		.where(eq(schema.projectNotes.projectId, projectId))
		.limit(1)
	return row?.body ?? ''
}

export async function getProjectClients(
	projectId: string,
): Promise<ProjectClient[]> {
	return useDb()
		.select({ id: schema.users.id, name: schema.users.name })
		.from(schema.projectClients)
		.innerJoin(
			schema.users,
			eq(schema.users.id, schema.projectClients.clientId),
		)
		.where(eq(schema.projectClients.projectId, projectId))
}
