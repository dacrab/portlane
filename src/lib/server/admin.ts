import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SECRET_KEY } from '$env/static/private';
import type { Database } from '$lib/database.types';

let _admin: ReturnType<typeof createClient<Database>> | null = null;

export function getAdminClient() {
	if (!_admin) {
		_admin = createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
			auth: { autoRefreshToken: false, persistSession: false },
		});
	}
	return _admin;
}
