import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SECRET_KEY } from '$env/static/private';
import type { Database } from '$lib/database.types';

export const adminClient = createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
	auth: { autoRefreshToken: false, persistSession: false },
});
