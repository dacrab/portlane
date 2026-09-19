import { redirect } from '@sveltejs/kit'
import { getAuth } from '$lib/server/auth'
import type { Actions } from './$types'

export const actions: Actions = {
	default: async ({ request }) => {
		await getAuth().api.signOut({ headers: request.headers })
		redirect(303, '/')
	},
}
