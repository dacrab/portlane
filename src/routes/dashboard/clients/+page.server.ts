import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();

	// Get all projects owned by this freelancer
	const { data: projects } = await locals.supabase
		.from('projects')
		.select('id, name')
		.eq('freelancer_id', user!.id);

	const projectIds = (projects ?? []).map((p) => p.id);
	if (projectIds.length === 0) return { clients: [] };

	// Get all clients across those projects
	const { data } = await locals.supabase
		.from('project_clients')
		.select('client_id, profiles(id, full_name), project_id')
		.in('project_id', projectIds);

	const projectNameById = Object.fromEntries((projects ?? []).map((p) => [p.id, p.name]));
	const clientMap = new Map<string, { id: string; full_name: string | null; projects: string[] }>();

	for (const row of data ?? []) {
		const profile = row.profiles as any;
		if (!profile) continue;
		if (!clientMap.has(profile.id)) {
			clientMap.set(profile.id, { id: profile.id, full_name: profile.full_name, projects: [] });
		}
		const name = projectNameById[row.project_id];
		if (name) clientMap.get(profile.id)!.projects.push(name);
	}

	return { clients: [...clientMap.values()] };
};
