import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

// Guards every portal subroute once instead of duplicating auth checks per page.
export const load: LayoutServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession()
	if (!session) redirect(303, '/login')
	if (user?.user_metadata?.role !== 'client') redirect(303, '/dashboard')
	return { user }
}
