import {
	and,
	desc,
	eq,
	getTableColumns,
	inArray,
	isNotNull,
	isNull,
	lt,
	ne,
	or,
} from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import * as schema from '#lib/server/db/schema.js'
import { useDb } from '#lib/server/db.js'

export async function getFreelancerInvoices(freelancerId: string) {
	return useDb()
		.select({
			...getTableColumns(schema.invoices),
			projectName: schema.projects.name,
			clientName: schema.users.name,
		})
		.from(schema.invoices)
		.innerJoin(
			schema.projects,
			eq(schema.projects.id, schema.invoices.projectId),
		)
		.innerJoin(schema.users, eq(schema.users.id, schema.invoices.clientId))
		.where(eq(schema.invoices.freelancerId, freelancerId))
		.orderBy(desc(schema.invoices.createdAt))
}

export async function getInvoiceProjects(freelancerId: string) {
	const db = useDb()
	const projects = await db
		.select({ id: schema.projects.id, name: schema.projects.name })
		.from(schema.projects)
		.where(
			and(
				eq(schema.projects.freelancerId, freelancerId),
				ne(schema.projects.status, 'archived'),
			),
		)

	const projectIds = projects.map((p) => p.id)
	const links = projectIds.length
		? await db
				.select({
					projectId: schema.projectClients.projectId,
					id: schema.projectClients.clientId,
					name: schema.users.name,
				})
				.from(schema.projectClients)
				.innerJoin(
					schema.users,
					eq(schema.users.id, schema.projectClients.clientId),
				)
				.where(inArray(schema.projectClients.projectId, projectIds))
		: []

	const clientsByProject = new Map<string, { id: string; name: string }[]>()
	for (const link of links) {
		const list = clientsByProject.get(link.projectId) ?? []
		list.push({ id: link.id, name: link.name })
		clientsByProject.set(link.projectId, list)
	}

	return projects.map((p) => ({
		...p,
		clients: clientsByProject.get(p.id) ?? [],
	}))
}

export async function getInvoiceById(invoiceId: string) {
	const freelancer = alias(schema.users, 'freelancer')
	const client = alias(schema.users, 'client')
	const [invoice] = await useDb()
		.select({
			...getTableColumns(schema.invoices),
			projectName: schema.projects.name,
			projectDescription: schema.projects.description,
			freelancerName: freelancer.name,
			clientName: client.name,
		})
		.from(schema.invoices)
		.innerJoin(
			schema.projects,
			eq(schema.projects.id, schema.invoices.projectId),
		)
		.innerJoin(freelancer, eq(freelancer.id, schema.invoices.freelancerId))
		.innerJoin(client, eq(client.id, schema.invoices.clientId))
		.where(eq(schema.invoices.id, invoiceId))
		.limit(1)
	return invoice ?? null
}

export async function getClientProjectInvoices(
	projectId: string,
	clientId: string,
) {
	return useDb()
		.select()
		.from(schema.invoices)
		.where(
			and(
				eq(schema.invoices.projectId, projectId),
				eq(schema.invoices.clientId, clientId),
			),
		)
		.orderBy(desc(schema.invoices.createdAt))
}

const REMINDER_INTERVAL_DAYS = 7

export interface InvoiceReminder {
	invoiceId: string
	amountCents: number
	currency: string
	dueDate: string | null
	projectName: string
	clientName: string
	clientEmail: string
	freelancerName: string
}

export async function markOverdueInvoices(today: string): Promise<number> {
	const updated = await useDb()
		.update(schema.invoices)
		.set({ status: 'overdue' })
		.where(
			and(
				eq(schema.invoices.status, 'sent'),
				isNotNull(schema.invoices.dueDate),
				lt(schema.invoices.dueDate, today),
			),
		)
		.returning({ id: schema.invoices.id })
	return updated.length
}

export async function getInvoicesNeedingReminder(
	now: Date,
): Promise<InvoiceReminder[]> {
	const db = useDb()
	const today = now.toISOString().slice(0, 10)
	const cutoff = new Date(
		now.getTime() - REMINDER_INTERVAL_DAYS * 86_400_000,
	).toISOString()
	const freelancer = alias(schema.users, 'freelancer')
	return db
		.select({
			invoiceId: schema.invoices.id,
			amountCents: schema.invoices.amountCents,
			currency: schema.invoices.currency,
			dueDate: schema.invoices.dueDate,
			projectName: schema.projects.name,
			clientName: schema.users.name,
			clientEmail: schema.users.email,
			freelancerName: freelancer.name,
		})
		.from(schema.invoices)
		.innerJoin(
			schema.projects,
			eq(schema.projects.id, schema.invoices.projectId),
		)
		.innerJoin(schema.users, eq(schema.users.id, schema.invoices.clientId))
		.innerJoin(freelancer, eq(freelancer.id, schema.invoices.freelancerId))
		.where(
			and(
				inArray(schema.invoices.status, ['sent', 'overdue']),
				isNotNull(schema.invoices.dueDate),
				lt(schema.invoices.dueDate, today),
				or(
					isNull(schema.invoices.lastReminderSentAt),
					lt(schema.invoices.lastReminderSentAt, cutoff),
				),
			),
		)
}

export async function markInvoicesReminded(
	invoiceIds: string[],
	at: Date,
): Promise<void> {
	if (invoiceIds.length === 0) return
	await useDb()
		.update(schema.invoices)
		.set({ lastReminderSentAt: at.toISOString() })
		.where(inArray(schema.invoices.id, invoiceIds))
}
