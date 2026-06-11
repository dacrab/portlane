import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import type { Database } from '$lib/database.types';

let _admin: ReturnType<typeof createClient<Database>> | null = null;

export function getAdminClient() {
	if (!_admin) {
		_admin = createClient<Database>(env.PUBLIC_SUPABASE_URL, privateEnv.SUPABASE_SECRET_KEY, {
			auth: { autoRefreshToken: false, persistSession: false },
		});
	}
	return _admin;
}
