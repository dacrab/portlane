import { fail, redirect } from '@sveltejs/kit'
import { MIN_PASSWORD_LENGTH, str } from '$lib/server/form'
import type { Actions } from './$types'

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData()
		const email = str(form, 'email').toLowerCase()
		const password = str(form, 'password')
		const full_name = str(form, 'full_name')

		if (password.length < MIN_PASSWORD_LENGTH)
			return fail(400, { error: 'Password must be at least 8 characters' })

		const { error } = await locals.supabase.auth.signUp({
			email,
			password,
			options: { data: { full_name } },
		})
		if (error) return fail(400, { error: error.message })

		redirect(303, '/dashboard')
	},
}
