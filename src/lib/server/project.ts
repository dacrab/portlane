import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '$lib/database.types'
import { callEdgeFn } from '$lib/server/edge'

export const getProjectMilestones = (
	supabase: SupabaseClient<Database>,
	projectId: string,
) =>
	supabase
		.from('milestones')
		.select('*')
		.eq('project_id', projectId)
		.order('position')

export const getProjectFiles = (
	supabase: SupabaseClient<Database>,
	projectId: string,
) =>
	supabase
		.from('files')
		.select('*')
		.eq('project_id', projectId)
		.order('created_at', { ascending: false })

export const getProjectComments = (
	supabase: SupabaseClient<Database>,
	projectId: string,
) =>
	supabase
		.from('comments')
		.select('*, profiles(full_name)')
		.eq('project_id', projectId)
		.order('created_at')

export const addComment = async (
	supabase: SupabaseClient<Database>,
	projectId: string,
	authorId: string,
	body: string,
) => {
	const { error } = await supabase
		.from('comments')
		.insert({ project_id: projectId, author_id: authorId, body })
	if (error) throw error
}

const MAX_FILE_SIZE = 100 * 1024 * 1024
const ALLOWED_MIME_PREFIXES = [
	'image/',
	'application/pdf',
	'application/zip',
	'application/x-zip-compressed',
	'text/',
]

export const uploadProjectFile = async (
	supabase: SupabaseClient<Database>,
	projectId: string,
	userId: string,
	file: File,
) => {
	if (file.size > MAX_FILE_SIZE)
		throw new Error('File exceeds maximum size of 100 MB')

	const allowed = ALLOWED_MIME_PREFIXES.some((p) => file.type.startsWith(p))
	if (!allowed && file.type !== '')
		throw new Error(`File type "${file.type}" is not supported`)

	const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
	const path = `${projectId}/${crypto.randomUUID()}-${safeName}`

	const { error: uploadErr } = await supabase.storage
		.from('project-files')
		.upload(path, file, { upsert: false })
	if (uploadErr) throw uploadErr

	const { error: insertErr } = await supabase.from('files').insert({
		project_id: projectId,
		uploaded_by: userId,
		name: file.name,
		storage_path: path,
		size_bytes: file.size,
	})
	if (insertErr) throw insertErr
}

export const inviteClientByEmail = async (
	accessToken: string,
	email: string,
	projectId: string,
) => {
	const result = await callEdgeFn('invite-client', accessToken, {
		email,
		projectId,
	})
	if ('error' in result) return new Error(result.error)
	return null
}

export const getHomeRoute = (role: string | undefined) =>
	role === 'client' ? '/portal' : '/dashboard'

export const ALLOWED_NEXT_PATHS = [
	'/dashboard',
	'/portal',
	'/reset-password',
] as const
