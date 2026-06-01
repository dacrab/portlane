import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

	const [
		{ data: projects },
		{ count: completed },
		{ count: pending },
		{ data: revenueRows },
		{ data: activity },
	] = await Promise.all([
		locals.supabase
			.from('projects')
			.select('id, name, status, due_date')
			.eq('freelancer_id', user!.id)
			.neq('status', 'archived')
			.order('created_at', { ascending: false }),
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
	]);

	const revenueMTD = (revenueRows ?? []).reduce((sum, r) => sum + r.amount_cents, 0);

	return {
		projects: projects ?? [],
		completed: completed ?? 0,
		pending: pending ?? 0,
		revenueMTD,
		activity: activity ?? [],
	};
};
