import { fail, redirect } from '@sveltejs/kit'
import { str } from '$lib/server/form'
import { getHomeRoute } from '$lib/server/project'
import type { Actions } from './$types'

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData()
		const email = str(form, 'email').toLowerCase()
		const password = str(form, 'password')

		const { data, error } = await locals.supabase.auth.signInWithPassword({
			email,
			password,
		})
		if (error) return fail(400, { error: error.message })

		redirect(303, getHomeRoute(data.user?.user_metadata?.role))
	},
}
