import { error } from '@sveltejs/kit'
import { getFreelancerClients } from '#lib/server/projects.js'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) error(401)

	const clients = await getFreelancerClients(locals.user.userId)

	return { clients }
}
