import type { Action } from '@sveltejs/kit'
import { fail } from '@sveltejs/kit'
import { and, desc, eq, getTableColumns, inArray, ne, or } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { str } from '$lib/server/form'
import { createCheckoutSession } from '$lib/server/stripe'

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** A freelancer's invoices, with the project and client names joined in. */
export async function getFreelancerInvoices(freelancerId: string) {
	const db = useDb()
	return db
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

/** Non-archived projects with their linked clients, for the invoice create form. */
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

/** A single invoice with project and both parties' names, or null if unknown. */
export async function getInvoiceById(invoiceId: string) {
	const db = useDb()
	const freelancer = alias(schema.users, 'freelancer')
	const client = alias(schema.users, 'client')
	const [invoice] = await db
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

/** Invoices on one project that belong to the given client, newest first. */
export async function getClientProjectInvoices(
	projectId: string,
	clientId: string,
) {
	const db = useDb()
	return db
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

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function createInvoice(input: {
	projectId: string
	clientId: string
	freelancerId: string
	amountCents: number
	dueDate: string | null
}) {
	await useDb().insert(schema.invoices).values(input)
}

export async function setInvoiceStatus(
	invoiceId: string,
	freelancerId: string,
	status: string,
) {
	await useDb()
		.update(schema.invoices)
		.set({ status })
		.where(
			and(
				eq(schema.invoices.id, invoiceId),
				eq(schema.invoices.freelancerId, freelancerId),
			),
		)
}

export async function deleteInvoice(invoiceId: string, freelancerId: string) {
	await useDb()
		.delete(schema.invoices)
		.where(
			and(
				eq(schema.invoices.id, invoiceId),
				eq(schema.invoices.freelancerId, freelancerId),
			),
		)
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

type CheckoutResult =
	| { url: string }
	| ReturnType<typeof fail<{ error: string }>>

/** Creates a single-use Stripe checkout session for an invoice the caller owns or receives. */
async function handleCheckoutAction(
	locals: App.Locals,
	form: FormData,
	origin: string,
): Promise<CheckoutResult> {
	if (!locals.user) return fail(401, { error: 'Unauthorized' })
	const invoiceId = str(form, 'invoiceId')
	if (!invoiceId) return fail(400, { error: 'Invoice ID required' })

	const db = useDb()
	const [invoice] = await db
		.select({
			id: schema.invoices.id,
			amountCents: schema.invoices.amountCents,
			currency: schema.invoices.currency,
			status: schema.invoices.status,
			stripeSessionId: schema.invoices.stripeSessionId,
			projectName: schema.projects.name,
		})
		.from(schema.invoices)
		.innerJoin(
			schema.projects,
			eq(schema.projects.id, schema.invoices.projectId),
		)
		.where(
			and(
				eq(schema.invoices.id, invoiceId),
				or(
					eq(schema.invoices.freelancerId, locals.user.userId),
					eq(schema.invoices.clientId, locals.user.userId),
				),
			),
		)
		.limit(1)

	if (!invoice) return fail(404, { error: 'Invoice not found' })
	if (invoice.stripeSessionId)
		return fail(400, { error: 'A payment session already exists' })
	if (invoice.status !== 'sent' && invoice.status !== 'overdue')
		return fail(400, { error: 'Invoice is not payable' })

	const result = await createCheckoutSession(
		{
			id: invoice.id,
			amountCents: invoice.amountCents,
			currency: invoice.currency,
			projectName: invoice.projectName,
		},
		origin,
	)

	await db
		.update(schema.invoices)
		.set({ stripeSessionId: result.sessionId })
		.where(eq(schema.invoices.id, invoice.id))

	return { url: result.url }
}

/** Shared `checkout` form action for every route that renders a "Pay now" button. */
export const checkoutAction: Action = async ({ locals, request, url }) =>
	handleCheckoutAction(locals, await request.formData(), url.origin)
