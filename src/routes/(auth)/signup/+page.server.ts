import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim().toLowerCase();
		const password = String(form.get('password') ?? '');
		const full_name = String(form.get('full_name') ?? '').trim();

		if (password.length < 8) return fail(400, { error: 'Password must be at least 8 characters' });

		const { error } = await locals.supabase.auth.signUp({
			email,
			password,
			options: { data: { full_name } },
		});
		if (error) return fail(400, { error: error.message });

		redirect(303, '/dashboard');
	},
};
