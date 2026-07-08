import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { str, MIN_PASSWORD_LENGTH } from '$lib/server/form';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) error(401);
	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('id, full_name')
		.eq('id', user.id)
		.single();
	return { profile, email: user.email ?? '' };
};

export const actions: Actions = {
	update_profile: async ({ locals, request }) => {
		const { user } = await locals.safeGetSession();
		if (!user) error(401);
		const form = await request.formData();
		const full_name = str(form, 'full_name');
		const { error: updateErr } = await locals.supabase.from('profiles').update({ full_name }).eq('id', user.id);
		if (updateErr) return fail(500, { profile_error: updateErr.message });
		return { profile_saved: true };
	},

	change_password: async ({ locals, request }) => {
		const form = await request.formData();
		const password = str(form, 'password');
		const confirm = str(form, 'confirm');
		if (password !== confirm) return fail(400, { password_error: 'Passwords do not match' });
		if (password.length < MIN_PASSWORD_LENGTH) return fail(400, { password_error: 'Password must be at least 8 characters' });
		const { error: updateErr } = await locals.supabase.auth.updateUser({ password });
		if (updateErr) return fail(400, { password_error: updateErr.message });
		return { password_saved: true };
	},

	delete_account: async ({ locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) error(401);
		await locals.supabase.from('profiles').delete().eq('id', user.id);
		await locals.supabase.auth.signOut();
		redirect(303, '/');
	},
};
