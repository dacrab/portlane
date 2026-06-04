import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getHomeRoute } from '$lib/server/project';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session) return;
	redirect(303, getHomeRoute(user?.user_metadata?.role));
};
