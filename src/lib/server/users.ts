import { eq } from 'drizzle-orm'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { deleteObjects } from '$lib/server/storage'

export async function getUserProfile(userId: string) {
	const db = useDb()
	const [profile] = await db
		.select({
			id: schema.users.id,
			name: schema.users.name,
			email: schema.users.email,
		})
		.from(schema.users)
		.where(eq(schema.users.id, userId))
		.limit(1)
	return profile ?? null
}

export async function updateUserName(userId: string, name: string) {
	await useDb()
		.update(schema.users)
		.set({ name })
		.where(eq(schema.users.id, userId))
}

/**
 * Erases everything owned by a user. The neon-http driver has no interactive
 * transactions, so batch() runs every statement atomically. Stored objects are
 * removed best-effort afterwards; the sweep cron collects any leftovers.
 */
export async function deleteUserAccount(userId: string) {
	const db = useDb()
	const uploads = await db
		.select({ storagePath: schema.files.storagePath })
		.from(schema.files)
		.where(eq(schema.files.uploadedBy, userId))

	await db.batch([
		db.delete(schema.comments).where(eq(schema.comments.authorId, userId)),
		db.delete(schema.files).where(eq(schema.files.uploadedBy, userId)),
		db.delete(schema.timeEntries).where(eq(schema.timeEntries.userId, userId)),
		db.delete(schema.invoices).where(eq(schema.invoices.freelancerId, userId)),
		db.delete(schema.invoices).where(eq(schema.invoices.clientId, userId)),
		db.delete(schema.projects).where(eq(schema.projects.freelancerId, userId)),
		db.delete(schema.users).where(eq(schema.users.id, userId)),
	])

	if (uploads.length > 0) {
		try {
			await deleteObjects(uploads.map((f) => f.storagePath))
		} catch {
			// Best-effort — the sweep cron will collect any orphans.
		}
	}
}
