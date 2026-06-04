import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) redirect(303, '/forgot-password');
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const password = form.get('password') as string;
		const confirm = form.get('confirm') as string;
		if (password !== confirm) return fail(400, { error: 'Passwords do not match' });
		if (password.length < 8) return fail(400, { error: 'Password must be at least 8 characters' });
		const { error } = await locals.supabase.auth.updateUser({ password });
		if (error) return fail(400, { error: error.message });
		redirect(303, '/dashboard');
	},
};
