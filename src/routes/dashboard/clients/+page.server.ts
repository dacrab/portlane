import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface ClientRow {
	client_id: string;
	full_name: string;
	projects: string[];
}

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) error(401);
	const { data } = await locals.supabase.rpc('get_freelancer_clients', { p_user_id: user.id });

	return {
		clients: ((data ?? []) as ClientRow[]).map(r => ({
			id: r.client_id,
			full_name: r.full_name,
			projects: r.projects ?? [],
		})),
	};
};
