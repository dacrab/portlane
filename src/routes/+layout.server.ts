import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, depends }) => {
	depends('supabase:auth');
	const { session } = await locals.safeGetSession();
	// Only expose the expiry timestamp — never the full session/user from cookie storage
	return { sessionExpiresAt: session?.expires_at ?? null };
};
