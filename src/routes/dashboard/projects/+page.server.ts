import { fail, redirect } from '@sveltejs/kit'
import { isProjectStatus } from '#lib/domain/status.js'
import { authed, DB_ERROR } from '#lib/server/action.js'
import { str } from '#lib/server/form.js'
import { requireUser } from '#lib/server/guard.js'
import { createProject } from '#lib/server/project-actions.js'
import { getProjectList } from '#lib/server/projects.js'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals)
	const projects = await getProjectList(user.userId)
	return { projects }
}

export const actions: Actions = {
	create: authed(async ({ user, form }) => {
		const name = str(form, 'name')
		const description = str(form, 'description') || null
		const dueDate = str(form, 'due_date') || null
		const status = str(form, 'status', 'planning')

		if (!name) return fail(400, { error: 'Name is required' })
		if (!isProjectStatus(status)) return fail(400, { error: 'Invalid status' })
		if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate))
			return fail(400, { error: 'Invalid due date' })

		let projectId: string
		try {
			projectId = await createProject({
				name,
				description,
				dueDate,
				status,
				freelancerId: user.userId,
			})
		} catch {
			return fail(500, { error: DB_ERROR })
		}

		redirect(303, `/dashboard/projects/${projectId}`)
	}),
}
