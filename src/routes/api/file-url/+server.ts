import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) error(401);

	const path = url.searchParams.get('path');
	if (!path) error(400, 'Missing path');

	const { data, error: storageErr } = await locals.supabase.storage
		.from('project-files')
		.createSignedUrl(path, 60 * 60);

	if (storageErr) error(500, storageErr.message);

	return json({ url: data.signedUrl });
};
