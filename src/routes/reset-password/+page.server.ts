import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { str, MIN_PASSWORD_LENGTH } from '$lib/server/form';

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) redirect(303, '/forgot-password');
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const password = str(form, 'password');
		const confirm = str(form, 'confirm');
		if (password !== confirm) return fail(400, { error: 'Passwords do not match' });
		if (password.length < MIN_PASSWORD_LENGTH) return fail(400, { error: 'Password must be at least 8 characters' });
		const { error: updateErr } = await locals.supabase.auth.updateUser({ password });
		if (updateErr) return fail(400, { error: updateErr.message });
		redirect(303, '/dashboard');
	},
};
