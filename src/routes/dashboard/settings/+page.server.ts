import { fail, redirect } from '@sveltejs/kit'
import { APIError } from 'better-auth/api'
import { PASSWORD_MIN_LENGTH } from '#lib/constants.js'
import { authed, DB_ERROR } from '#lib/server/action.js'
import { getAuth } from '#lib/server/auth.js'
import { str } from '#lib/server/form.js'
import { requireUser } from '#lib/server/guard.js'
import {
	deleteUserAccount,
	getUserProfile,
	updateUserName,
} from '#lib/server/users.js'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals)
	const profile = await getUserProfile(user.userId)
	return { profile, email: profile?.email ?? '' }
}

export const actions: Actions = {
	update_profile: authed(async ({ user, form }) => {
		const name = str(form, 'name')
		if (!name) return fail(400, { profile_error: 'Name is required' })
		try {
			await updateUserName(user.userId, name)
		} catch {
			return fail(500, { profile_error: DB_ERROR })
		}
		return { profile_saved: true }
	}),

	change_password: authed(async ({ event, form }) => {
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
				headers: event.request.headers,
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
	}),

	delete_account: authed(async ({ event, user }) => {
		try {
			await getAuth().api.signOut({ headers: event.request.headers })
			await deleteUserAccount(user.userId)
		} catch {
			return fail(500, { profile_error: DB_ERROR })
		}
		redirect(303, '/')
	}),
}
