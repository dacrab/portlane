import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/database.types';

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

export const inviteClientByEmail = async (adminClient: { auth: { admin: { inviteUserByEmail: (email: string, options: Record<string, unknown>) => Promise<{ error?: { message: string } | null }> } } }, email: string, origin: string, projectId: string) => {
	const redirectTo = `${origin}/auth/callback?next=/portal?project=${projectId}`;
	const { error } = await adminClient.auth.admin.inviteUserByEmail(email, {
		data: { role: 'client' },
		redirectTo,
	});
	return error ?? null;
};

export const getHomeRoute = (role: string | undefined) =>
	role === 'client' ? '/portal' : '/dashboard';
