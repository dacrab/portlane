import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals, depends }) => {
	depends('supabase:auth')
	const { session } = await locals.safeGetSession()
	return { sessionExpiresAt: session?.expires_at ?? null }
}
