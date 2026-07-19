import { error, fail } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
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

	delete_account: async ({ locals }) => {
		if (!locals.user) error(401)
		const db = useDb()
		await db.delete(schema.users).where(eq(schema.users.id, locals.user.userId))
	},
}
