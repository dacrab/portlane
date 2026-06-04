import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getHomeRoute } from '$lib/server/project';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const email = (form.get('email') as string).trim().toLowerCase();
		const password = form.get('password') as string;

		const { data, error } = await locals.supabase.auth.signInWithPassword({ email, password });
		if (error) return fail(400, { error: error.message });

		redirect(303, getHomeRoute(data.user?.user_metadata?.role));
	},
};
