import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session) redirect(303, '/login');

	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('last_read_comments_at')
		.eq('id', user!.id)
		.single();

	const since = profile?.last_read_comments_at ?? new Date(0).toISOString();

	const { data: projectRows } = await locals.supabase
		.from('projects')
		.select('id')
		.eq('freelancer_id', user!.id);

	const projectIds = (projectRows ?? []).map((p: any) => p.id);

	let unreadComments = 0;
	if (projectIds.length > 0) {
		const { count } = await locals.supabase
			.from('comments')
			.select('id', { count: 'exact', head: true })
			.in('project_id', projectIds)
			.neq('author_id', user!.id)
			.gt('created_at', since);
		unreadComments = count ?? 0;
	}

	return { user, unreadComments };
};
