import { requireUser } from '#lib/server/guard.js'
import { getFreelancerClients } from '#lib/server/projects.js'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals)
	const clients = await getFreelancerClients(user.userId)
	return { clients }
}
