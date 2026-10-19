import { redirect } from '@sveltejs/kit'
import { getHomeRoute } from '#lib/server/project.js'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) return
	redirect(303, getHomeRoute(locals.user.role))
}
