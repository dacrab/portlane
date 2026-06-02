import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	const monthStart = new Date(new Date().setDate(1)).toISOString();

	const [
		{ data: projects },
		{ data: stats },
		{ data: activity },
		{ data: unreadComments },
	] = await Promise.all([
		locals.supabase
			.from('projects')
			.select('id, name, status, due_date')
			.eq('freelancer_id', user!.id)
			.neq('status', 'archived')
			.order('created_at', { ascending: false }),
		locals.supabase.rpc('get_dashboard_stats', { p_user_id: user!.id, p_month_start: monthStart }),
		locals.supabase.rpc('get_activity_feed', { p_user_id: user!.id, p_limit: 5 }),
		locals.supabase.rpc('get_unread_comments', { p_user_id: user!.id }),
	]);

	const s = (stats as any[])?.[0] ?? {};

	const onboarding = {
		hasProject: (projects?.length ?? 0) > 0,
		hasClient: (s.total_clients ?? 0) > 0,
		hasInvoice: (s.total_invoices ?? 0) > 0,
		hasProfile: !!(user?.user_metadata?.full_name),
	};

	return {
		projects: projects ?? [],
		completed: s.completed_projects ?? 0,
		pending: s.review_projects ?? 0,
		revenueMTD: s.revenue_mtd ?? 0,
		activity: activity ?? [],
		unreadComments: unreadComments ?? [],
		onboarding,
		onboardingDone: Object.values(onboarding).every(Boolean),
	};
};

export const actions: Actions = {
	mark_read: async ({ locals }) => {
		const { user } = await locals.safeGetSession();
		await locals.supabase
			.from('profiles')
			.update({ last_read_comments_at: new Date().toISOString() })
			.eq('id', user!.id);
	},
};
