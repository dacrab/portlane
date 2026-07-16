import { error } from '@sveltejs/kit'
import type { Database } from '$lib/database.types'
import type { PageServerLoad } from './$types'

type ClientRow =
	Database['public']['Functions']['get_freelancer_clients']['Returns'][number]

function isClientRows(v: unknown): v is ClientRow[] {
	return (
		Array.isArray(v) &&
		v.every(
			(item) =>
				typeof item === 'object' && item !== null && 'client_id' in item,
		)
	)
}

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession()
	if (!user) error(401)
	const { data } = await locals.supabase.rpc('get_freelancer_clients', {
		p_user_id: user.id,
	})

	const rows: ClientRow[] = data && isClientRows(data) ? data : []

	return {
		clients: rows.map((r) => ({
			id: r.client_id,
			full_name: r.full_name,
			projects: r.projects ?? [],
		})),
	}
}
