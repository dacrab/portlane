import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/dashboard';

	if (!next.startsWith('/') || !['/dashboard', '/portal', '/reset-password'].some(p => next === p || next.startsWith(p + '?'))) {
		redirect(303, '/dashboard');
	}

	if (code) {
		await locals.supabase.auth.exchangeCodeForSession(code);
	}

	redirect(303, next);
};
