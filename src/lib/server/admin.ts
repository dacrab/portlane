import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import type { Database } from '$lib/database.types';

export function getAdminClient() {
	return createClient<Database>(env.PUBLIC_SUPABASE_URL, privateEnv.SUPABASE_SECRET_KEY, {
		auth: { autoRefreshToken: false, persistSession: false },
	});
}
