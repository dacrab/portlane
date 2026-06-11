import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getHomeRoute } from '$lib/server/project';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim().toLowerCase();
		const password = String(form.get('password') ?? '');

		const { data, error } = await locals.supabase.auth.signInWithPassword({ email, password });
		if (error) return fail(400, { error: error.message });

		redirect(303, getHomeRoute(data.user?.user_metadata?.role));
	},
};
