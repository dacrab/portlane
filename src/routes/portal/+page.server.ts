import { error, fail, redirect } from '@sveltejs/kit'
import { and, desc, eq, getTableColumns, sql } from 'drizzle-orm'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { DB_ERROR, formFile, str } from '$lib/server/form'
import {
	addComment,
	getProjectComments,
	getProjectFiles,
	getProjectMilestones,
	uploadProjectFile,
} from '$lib/server/project'
import { createCheckoutSession } from '$lib/server/stripe'
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

export const actions: Actions = {
	comment: async ({ locals, url, request }) => {
		if (!locals.user) error(401)
		const projectId = url.searchParams.get('project')
		if (!projectId) error(400, 'Missing project')
		const form = await request.formData()
		const body = str(form, 'body')
		if (!body) return
		try {
			await addComment(projectId, locals.user.userId, body)
		} catch {
			return fail(500, { error: DB_ERROR })
		}
	},

	approve: async ({ locals, url, request }) => {
		if (!locals.user) error(401)
		const projectId = url.searchParams.get('project')
		if (!projectId) error(400, 'Missing project')
		const note = str(await request.formData(), 'note') || null
		const db = useDb()
		await db.execute(
			sql`SELECT approve_project(${projectId}, ${locals.user.userId}, ${note})`,
		)
	},

	request_revision: async ({ locals, url, request }) => {
		if (!locals.user) error(401)
		const projectId = url.searchParams.get('project')
		if (!projectId) error(400, 'Missing project')
		const note = str(await request.formData(), 'note') || null
		const db = useDb()
		await db.execute(
			sql`SELECT request_revision(${projectId}, ${locals.user.userId}, ${note})`,
		)
	},

	upload_file: async ({ locals, url, request }) => {
		if (!locals.user) error(401)
		const projectId = url.searchParams.get('project')
		if (!projectId) error(400, 'Missing project')
		const form = await request.formData()
		const file = formFile(form, 'file')
		if (!file?.size) return
		try {
			await uploadProjectFile(projectId, locals.user.userId, file)
		} catch {
			error(500, DB_ERROR)
		}
	},

	checkout: async ({ locals, request, url: reqUrl }) => {
		if (!locals.user) error(401)
		const form = await request.formData()
		const invoiceId = str(form, 'invoiceId')
		if (!invoiceId) return fail(400, { missing: true })

		const db = useDb()
		const [invoice] = await db
			.select({
				id: schema.invoices.id,
				amountCents: schema.invoices.amountCents,
				currency: schema.invoices.currency,
				projectName: sql<string>`(SELECT name FROM project WHERE id = ${schema.invoices.projectId})`,
			})
			.from(schema.invoices)
			.where(
				and(
					eq(schema.invoices.id, invoiceId),
					eq(schema.invoices.clientId, locals.user.userId),
				),
			)
			.limit(1)

		if (!invoice) return fail(404, { error: 'Invoice not found' })

		const result = await createCheckoutSession(
			{
				id: invoice.id,
				amount_cents: invoice.amountCents,
				currency: invoice.currency,
				project_name: invoice.projectName,
			},
			reqUrl.origin,
		)

		return { url: result.url }
	},
}
