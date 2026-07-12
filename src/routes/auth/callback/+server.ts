import { redirect } from '@sveltejs/kit'
import { ALLOWED_NEXT_PATHS } from '$lib/server/project'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code')
	const next = url.searchParams.get('next') ?? '/dashboard'

	if (code) {
		await locals.supabase.auth.exchangeCodeForSession(code)
	}

	const valid =
		next.startsWith('/') &&
		ALLOWED_NEXT_PATHS.some((p) => next === p || next.startsWith(`${p}?`))
	redirect(303, valid ? next : '/dashboard')
}
