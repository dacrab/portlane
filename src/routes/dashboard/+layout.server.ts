import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session) redirect(303, '/login');

	const { data } = await locals.supabase.rpc('get_unread_comment_count', { p_user_id: user!.id });

	return { user, unreadComments: (data as number) ?? 0 };
};
