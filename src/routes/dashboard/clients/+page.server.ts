import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();

	const { data } = await locals.supabase
		.from('project_clients')
		.select('profiles(id, full_name), projects!inner(id, name, freelancer_id)')
		.eq('projects.freelancer_id', user!.id);

	const clientMap = new Map<string, { id: string; full_name: string | null; projects: string[] }>();
	for (const row of data ?? []) {
		const profile = row.profiles as any;
		const project = row.projects as any;
		if (!profile) continue;
		if (!clientMap.has(profile.id)) {
			clientMap.set(profile.id, { id: profile.id, full_name: profile.full_name, projects: [] });
		}
		clientMap.get(profile.id)!.projects.push(project.name);
	}

	return { clients: [...clientMap.values()] };
};
