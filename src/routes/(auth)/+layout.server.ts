import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session) return;
	redirect(303, user?.user_metadata?.role === 'client' ? '/portal' : '/dashboard');
};
