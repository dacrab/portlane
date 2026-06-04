import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const allowedPaths = ['/dashboard', '/portal', '/reset-password'];

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/dashboard';

	if (!allowedPaths.includes(next) || !next.startsWith('/')) {
		redirect(303, '/dashboard');
	}

	if (code) {
		await locals.supabase.auth.exchangeCodeForSession(code);
	}

	redirect(303, next);
};
