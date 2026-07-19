import type { Handle } from '@sveltejs/kit'
import { svelteKitHandler } from 'better-auth/svelte-kit'
import { eq } from 'drizzle-orm'
import { building } from '$app/environment'
import { auth } from '$lib/server/auth'
import { useDb } from '$lib/server/db'
import { users } from '$lib/server/db/schema'

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({
		headers: event.request.headers,
	})

	if (session) {
		const db = useDb()
		const rows = await db
			.select({ id: users.id, email: users.email, role: users.role })
			.from(users)
			.where(eq(users.id, session.user.id))
			.limit(1)

		if (rows.length > 0) {
			const row = rows[0]
			if (row) {
				event.locals.user = {
					userId: row.id,
					email: row.email,
					role: row.role,
				}
			}
		}
	}

	return svelteKitHandler({ event, resolve, auth, building })
}
