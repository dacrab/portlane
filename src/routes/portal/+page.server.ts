import { error, fail, redirect } from '@sveltejs/kit'
import { and, desc, eq, getTableColumns, sql } from 'drizzle-orm'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { DB_ERROR, formFile, str } from '$lib/server/form'
import { requireClient } from '$lib/server/guard'
import { runInvoiceCheckout } from '$lib/server/invoices'
import {
	addComment,
	FileUploadError,
	getProjectComments,
	getProjectFiles,
	getProjectMilestones,
	uploadProjectFile,
} from '$lib/server/project'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(303, '/login')
	const userId = locals.user.userId
	const db = useDb()

	const projectId = url.searchParams.get('project')

	if (!projectId) {
		const projects = await db
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
			.innerJoin(
				schema.users,
				eq(schema.users.id, schema.projects.freelancerId),
			)
			.where(eq(schema.projectClients.clientId, userId))

		return {
			project: null,
			projects,
			milestones: [],
			files: [],
			comments: [],
			invoices: [],
			user: locals.user,
		}
	}

	const [membership] = await db
		.select({ one: sql`1` })
		.from(schema.projectClients)
		.where(
			and(
				eq(schema.projectClients.projectId, projectId),
				eq(schema.projectClients.clientId, userId),
			),
		)
		.limit(1)

	if (!membership) error(403, 'Forbidden')

	const [projectRows, milestones, files, comments, invoices] =
		await Promise.all([
			db
				.select({
					...getTableColumns(schema.projects),
					freelancerName: schema.users.name,
				})
				.from(schema.projects)
				.innerJoin(
					schema.users,
					eq(schema.users.id, schema.projects.freelancerId),
				)
				.where(eq(schema.projects.id, projectId))
				.limit(1),
			getProjectMilestones(projectId),
			getProjectFiles(projectId),
			getProjectComments(projectId),
			db
				.select()
				.from(schema.invoices)
				.where(
					and(
						eq(schema.invoices.projectId, projectId),
						eq(schema.invoices.clientId, userId),
					),
				)
				.orderBy(desc(schema.invoices.createdAt)),
		])

	const project = projectRows[0]
	if (!project) error(404, 'Project not found')

	return {
		project,
		projects: [],
		milestones,
		files,
		comments,
		invoices,
		user: locals.user,
	}
}

type ClientGuardResult =
	| { err: ReturnType<typeof fail> }
	| { err?: undefined; userId: string; projectId: string }

async function clientGuard(
	locals: App.Locals,
	url: URL,
): Promise<ClientGuardResult> {
	const projectId = url.searchParams.get('project')
	if (!projectId) return { err: fail(400, { error: 'Missing project' }) }
	const guard = await requireClient(locals, projectId)
	if (guard.err) return { err: guard.err }
	return { userId: guard.userId, projectId: guard.projectId }
}

export const actions: Actions = {
	comment: async ({ locals, url, request }) => {
		const guard = await clientGuard(locals, url)
		if (guard.err) return guard.err
		const form = await request.formData()
		const body = str(form, 'body')
		if (!body) return fail(400, { error: 'Message body is required' })
		try {
			await addComment(guard.projectId, guard.userId, body)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	approve: async ({ locals, url, request }) => {
		const guard = await clientGuard(locals, url)
		if (guard.err) return guard.err
		const note = str(await request.formData(), 'note') || null
		const db = useDb()
		await db.execute(
			sql`SELECT approve_project(${guard.projectId}, ${guard.userId}, ${note})`,
		)
	},

	request_revision: async ({ locals, url, request }) => {
		const guard = await clientGuard(locals, url)
		if (guard.err) return guard.err
		const note = str(await request.formData(), 'note') || null
		const db = useDb()
		await db.execute(
			sql`SELECT request_revision(${guard.projectId}, ${guard.userId}, ${note})`,
		)
	},

	upload_file: async ({ locals, url, request }) => {
		const guard = await clientGuard(locals, url)
		if (guard.err) return guard.err
		const form = await request.formData()
		const file = formFile(form, 'file')
		if (!file?.size) return fail(400, { error: 'No file provided' })
		try {
			await uploadProjectFile(guard.projectId, guard.userId, file)
		} catch (e) {
			if (e instanceof FileUploadError) {
				const status = e.code === 'too_large' ? 413 : 415
				return fail(status, { error: e.message })
			}
			return fail(500, { error: DB_ERROR })
		}
	},

	checkout: async ({ locals, request, url: reqUrl }) => {
		if (!locals.user) return fail(401, { error: 'Unauthorized' })
		const form = await request.formData()
		const invoiceId = str(form, 'invoiceId')
		if (!invoiceId) return fail(400, { error: 'Invoice ID required' })

		return runInvoiceCheckout(invoiceId, locals.user.userId, reqUrl.origin)
	},
}
