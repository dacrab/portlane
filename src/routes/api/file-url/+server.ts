import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const SIGNED_URL_TTL_SECONDS = 60 * 60
const STORAGE_ERROR = 'Unable to generate download URL.'

export const GET: RequestHandler = async ({ url, locals }) => {
	const { session, user } = await locals.safeGetSession()
	if (!session) error(401)
	if (!user) error(401)

	const path = url.searchParams.get('path')
	if (!path) error(400, 'Missing path')

	const projectId = path.split('/')[0]
	if (!projectId) error(400, 'Invalid path')

	const { data: access } = await locals.supabase
		.from('project_clients')
		.select('project_id')
		.eq('project_id', projectId)
		.eq('client_id', user.id)
		.maybeSingle()
	const { data: owned } = await locals.supabase
		.from('projects')
		.select('id')
		.eq('id', projectId)
		.eq('freelancer_id', user.id)
		.maybeSingle()
	if (!access && !owned) error(403, 'Forbidden')

	const { data, error: storageErr } = await locals.supabase.storage
		.from('project-files')
		.createSignedUrl(path, SIGNED_URL_TTL_SECONDS)

	if (storageErr) error(500, STORAGE_ERROR)

	return json({ url: data.signedUrl })
}
