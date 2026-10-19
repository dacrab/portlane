import { error, fail, redirect } from '@sveltejs/kit'
import { isProjectStatus } from '#lib/fmt.js'
import { DB_ERROR, str } from '#lib/server/form.js'
import {
	createProject,
	getProjectList,
	inviteClientByEmail,
} from '#lib/server/projects.js'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) error(401)
	const projects = await getProjectList(locals.user.userId)
	return { projects }
}

export const actions: Actions = {
	create: async ({ locals, request }) => {
		if (!locals.user) error(401)
		const form = await request.formData()
		const name = str(form, 'name')
		const description = str(form, 'description') || null
		const due_date = str(form, 'due_date') || null
		const status = str(form, 'status', 'planning')
		const client_email = str(form, 'client_email').toLowerCase() || null

		if (!name) return fail(400, { error: 'Name is required' })
		if (!isProjectStatus(status)) return fail(400, { error: 'Invalid status' })
		if (due_date && !/^\d{4}-\d{2}-\d{2}$/.test(due_date))
			return fail(400, { error: 'Invalid due date' })

		let projectId: string
		try {
			projectId = await createProject({
				name,
				description,
				dueDate: due_date,
				status,
				freelancerId: locals.user.userId,
			})
			if (client_email) await inviteClientByEmail(client_email, projectId)
		} catch {
			return fail(400, { error: DB_ERROR })
		}

		redirect(303, `/dashboard/projects/${projectId}`)
	},
}
