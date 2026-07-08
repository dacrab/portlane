import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) redirect(303, '/forgot-password');
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const password_val = form.get('password');
		const confirm_val = form.get('confirm');
		const password = typeof password_val === 'string' ? password_val : '';
		const confirm = typeof confirm_val === 'string' ? confirm_val : '';
		if (password !== confirm) return fail(400, { error: 'Passwords do not match' });
		if (password.length < 8) return fail(400, { error: 'Password must be at least 8 characters' });
		const { error: updateErr } = await locals.supabase.auth.updateUser({ password });
		if (updateErr) return fail(400, { error: updateErr.message });
		redirect(303, '/dashboard');
	},
};
