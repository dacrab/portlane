import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	const { data } = await locals.supabase.rpc('get_freelancer_clients', { p_user_id: user!.id });

	return {
		clients: (data ?? []).map((r: any) => ({
			id: r.client_id,
			full_name: r.full_name,
			projects: r.projects ?? [],
		})),
	};
};
