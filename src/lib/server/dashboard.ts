import { and, count, countDistinct, eq, sum } from 'drizzle-orm'
import * as schema from '#lib/server/db/schema.js'
import { useDb } from '#lib/server/db.js'

export interface DashboardStats {
	revenue: number
	totalInvoices: number
	totalClients: number
	profileName: string
}

/** Aggregate counters plus the freelancer's display name, for the dashboard. */
export async function getDashboardStats(
	freelancerId: string,
): Promise<DashboardStats> {
	const db = useDb()
	const [revenueRows, invoiceRows, clientRows, profileRows] = await Promise.all(
		[
			db
				.select({ total: sum(schema.invoices.amountCents) })
				.from(schema.invoices)
				.where(
					and(
						eq(schema.invoices.freelancerId, freelancerId),
						eq(schema.invoices.status, 'paid'),
					),
				),
			db
				.select({ total: count() })
				.from(schema.invoices)
				.where(eq(schema.invoices.freelancerId, freelancerId)),
			db
				.select({ total: countDistinct(schema.projectClients.clientId) })
				.from(schema.projectClients)
				.innerJoin(
					schema.projects,
					eq(schema.projects.id, schema.projectClients.projectId),
				)
				.where(eq(schema.projects.freelancerId, freelancerId)),
			db
				.select({ name: schema.users.name })
				.from(schema.users)
				.where(eq(schema.users.id, freelancerId))
				.limit(1),
		],
	)

	return {
		revenue: Number(revenueRows[0]?.total ?? 0),
		totalInvoices: Number(invoiceRows[0]?.total ?? 0),
		totalClients: Number(clientRows[0]?.total ?? 0),
		profileName: profileRows[0]?.name ?? '',
	}
}
