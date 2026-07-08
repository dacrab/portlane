import { env } from '$env/dynamic/public';

function requireEnv(key: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const PUBLIC_SUPABASE_URL = requireEnv('PUBLIC_SUPABASE_URL', env.PUBLIC_SUPABASE_URL);
export const PUBLIC_SUPABASE_PUBLISHABLE_KEY = requireEnv('PUBLIC_SUPABASE_PUBLISHABLE_KEY', env.PUBLIC_SUPABASE_PUBLISHABLE_KEY);
export const EDGE_FN_BASE = PUBLIC_SUPABASE_URL.replace(/\/$/, '') + '/functions/v1';
