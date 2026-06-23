import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/database.types';
import { env } from '$env/dynamic/public';

const EDGE_FN_BASE = env.PUBLIC_SUPABASE_URL.replace(/\/$/, '') + '/functions/v1';

export const getProjectMilestones = (supabase: SupabaseClient<Database>, projectId: string) =>
	supabase.from('milestones').select('*').eq('project_id', projectId).order('position');

export const getProjectFiles = (supabase: SupabaseClient<Database>, projectId: string) =>
	supabase.from('files').select('*').eq('project_id', projectId).order('created_at', { ascending: false });

export const getProjectComments = (supabase: SupabaseClient<Database>, projectId: string) =>
	supabase.from('comments').select('*, profiles(full_name)').eq('project_id', projectId).order('created_at');

export const addComment = async (supabase: SupabaseClient<Database>, projectId: string, authorId: string, body: string) => {
	await supabase.from('comments').insert({ project_id: projectId, author_id: authorId, body });
};

export const uploadProjectFile = async (
	supabase: SupabaseClient<Database>,
	projectId: string,
	userId: string,
	file: File,
) => {
	const path = `${projectId}/${crypto.randomUUID()}-${file.name}`;
	const { error: uploadErr } = await supabase.storage.from('project-files').upload(path, file);
	if (uploadErr) throw uploadErr;

	await supabase.from('files').insert({
		project_id: projectId,
		uploaded_by: userId,
		name: file.name,
		storage_path: path,
		size_bytes: file.size,
	});
};

export const inviteClientByEmail = async (accessToken: string, email: string, projectId: string) => {
	const res = await fetch(`${EDGE_FN_BASE}/invite-client`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ email, projectId }),
	});

	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		return new Error((body as { error?: string }).error || 'Invitation failed');
	}
	return null;
};

export const getHomeRoute = (role: string | undefined) =>
	role === 'client' ? '/portal' : '/dashboard';
