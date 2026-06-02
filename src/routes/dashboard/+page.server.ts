import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

	const { data: projects } = await locals.supabase
		.from('projects')
		.select('id, name, status, due_date')
		.eq('freelancer_id', user!.id)
		.neq('status', 'archived')
		.order('created_at', { ascending: false });

	const projectIds = (projects ?? []).map((p: any) => p.id);

	const [
		{ count: completed },
		{ count: pending },
		{ data: revenueRows },
		{ data: activity },
		{ count: invoiceCount },
		{ count: clientCount },
		{ data: profileRow },
	] = await Promise.all([
		locals.supabase
			.from('projects')
			.select('id', { count: 'exact', head: true })
			.eq('freelancer_id', user!.id)
			.eq('status', 'completed'),
		locals.supabase
			.from('projects')
			.select('id', { count: 'exact', head: true })
			.eq('freelancer_id', user!.id)
			.eq('status', 'review'),
		locals.supabase
			.from('invoices')
			.select('amount_cents')
			.eq('freelancer_id', user!.id)
			.eq('status', 'paid')
			.gte('created_at', monthStart),
		locals.supabase
			.from('comments')
			.select('body, created_at, profiles(full_name), projects!inner(name, freelancer_id)')
			.eq('projects.freelancer_id', user!.id)
			.order('created_at', { ascending: false })
			.limit(5),
		locals.supabase
			.from('invoices')
			.select('id', { count: 'exact', head: true })
			.eq('freelancer_id', user!.id),
		projectIds.length > 0
			? locals.supabase
				.from('project_clients')
				.select('client_id', { count: 'exact', head: true })
				.in('project_id', projectIds)
			: Promise.resolve({ count: 0, data: null, error: null }),
		locals.supabase
			.from('profiles')
			.select('last_read_comments_at')
			.eq('id', user!.id)
			.single(),
	]);

	const revenueMTD = (revenueRows ?? []).reduce((sum, r) => sum + r.amount_cents, 0);
	const since = profileRow?.last_read_comments_at ?? new Date(0).toISOString();

	// Unread = client comments on freelancer's projects after last_read
	let unreadComments: any[] = [];
	if (projectIds.length > 0) {
		const { data } = await locals.supabase
			.from('comments')
			.select('id, body, created_at, profiles(full_name), projects!inner(id, name, freelancer_id)')
			.in('project_id', projectIds)
			.neq('author_id', user!.id)
			.gt('created_at', since)
			.order('created_at', { ascending: false });
		unreadComments = data ?? [];
	}

	const onboarding = {
		hasProject: (projects?.length ?? 0) > 0,
		hasClient: (clientCount ?? 0) > 0,
		hasInvoice: (invoiceCount ?? 0) > 0,
		hasProfile: !!(user?.user_metadata?.full_name),
	};

	return {
		projects: projects ?? [],
		completed: completed ?? 0,
		pending: pending ?? 0,
		revenueMTD,
		activity: activity ?? [],
		onboarding,
		onboardingDone: Object.values(onboarding).every(Boolean),
		unreadComments,
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
