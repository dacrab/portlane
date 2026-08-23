import { error, fail, redirect } from '@sveltejs/kit'
import { del } from '@vercel/blob'
import { APIError } from 'better-auth/api'
import { eq } from 'drizzle-orm'
import { PASSWORD_MIN_LENGTH } from '$lib/constants'
import { auth } from '$lib/server/auth'
import { useDb } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { DB_ERROR, str } from '$lib/server/form'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) error(401)

	const db = useDb()
	const rows = await db
		.select({
			id: schema.users.id,
			name: schema.users.name,
			email: schema.users.email,
		})
		.from(schema.users)
		.where(eq(schema.users.id, locals.user.userId))
		.limit(1)

	const profile = rows[0]
	return { profile, email: profile?.email ?? '' }
}

export const actions: Actions = {
	update_profile: async ({ locals, request }) => {
		if (!locals.user) error(401)
		const form = await request.formData()
		const name = str(form, 'name')
		const db = useDb()
		try {
			await db
				.update(schema.users)
				.set({ name })
				.where(eq(schema.users.id, locals.user.userId))
		} catch {
			return fail(500, { profile_error: DB_ERROR })
		}
		return { profile_saved: true }
	},

	change_password: async ({ locals, request }) => {
		if (!locals.user) error(401)
		const form = await request.formData()
		const currentPassword = str(form, 'current_password')
		const password = str(form, 'password')
		const confirm = str(form, 'confirm')

		if (!(currentPassword && password && confirm))
			return fail(400, { password_error: 'All fields are required' })
		if (password.length < PASSWORD_MIN_LENGTH)
			return fail(400, {
				password_error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
			})
		if (password !== confirm)
			return fail(400, { password_error: 'Passwords do not match' })

		try {
			await auth.api.changePassword({
				body: { currentPassword, newPassword: password },
				headers: request.headers,
			})
		} catch (e) {
			if (e instanceof APIError) {
				const message = e.message ?? 'Could not update password'
				const status = typeof e.status === 'number' ? e.status : 400
				return fail(status, { password_error: message })
			}
			throw e
		}
		return { password_saved: true }
	},

	delete_account: async ({ locals, request }) => {
		if (!locals.user) error(401)
		const userId = locals.user.userId
		const db = useDb()

		try {
			const uploads = await db
				.select({ storagePath: schema.files.storagePath })
				.from(schema.files)
				.where(eq(schema.files.uploadedBy, userId))

			await auth.api.signOut({ headers: request.headers })

			await db
				.delete(schema.comments)
				.where(eq(schema.comments.authorId, userId))
			await db.delete(schema.files).where(eq(schema.files.uploadedBy, userId))
			await db
				.delete(schema.timeEntries)
				.where(eq(schema.timeEntries.userId, userId))
			await db
				.delete(schema.invoices)
				.where(eq(schema.invoices.clientId, userId))

			await db.delete(schema.users).where(eq(schema.users.id, userId))

			// Blob deletion is best-effort; a sweep job should collect any orphans.
			if (uploads.length > 0) {
				await Promise.allSettled(uploads.map((f) => del(f.storagePath)))
			}
		} catch {
			return fail(500, { profile_error: DB_ERROR })
		}
		redirect(303, '/')
	},
}
