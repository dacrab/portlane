import { error, fail, redirect } from '@sveltejs/kit'
import { APIError } from 'better-auth/api'
import { PASSWORD_MIN_LENGTH } from '#lib/constants.js'
import { getAuth } from '#lib/server/auth.js'
import { DB_ERROR, str } from '#lib/server/form.js'
import {
	deleteUserAccount,
	getUserProfile,
	updateUserName,
} from '#lib/server/users.js'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) error(401)

	const profile = await getUserProfile(locals.user.userId)
	return { profile, email: profile?.email ?? '' }
}

export const actions: Actions = {
	update_profile: async ({ locals, request }) => {
		if (!locals.user) error(401)
		const name = str(await request.formData(), 'name')
		try {
			await updateUserName(locals.user.userId, name)
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
			await getAuth().api.changePassword({
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
		try {
			await getAuth().api.signOut({ headers: request.headers })
			await deleteUserAccount(locals.user.userId)
		} catch {
			return fail(500, { profile_error: DB_ERROR })
		}
		redirect(303, '/')
	},
}
