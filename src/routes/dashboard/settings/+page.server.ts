import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('id, full_name')
		.eq('id', user!.id)
		.single();
	return { profile, email: user!.email ?? '' };
};

export const actions: Actions = {
	update_profile: async ({ locals, request }) => {
		const { user } = await locals.safeGetSession();
		const form = await request.formData();
		const full_name = (form.get('full_name') as string).trim();
		const { error } = await locals.supabase.from('profiles').update({ full_name }).eq('id', user!.id);
		if (error) return fail(500, { profile_error: error.message });
		return { profile_saved: true };
	},

	change_password: async ({ locals, request }) => {
		const form = await request.formData();
		const password = form.get('password') as string;
		const confirm = form.get('confirm') as string;
		if (password !== confirm) return fail(400, { password_error: 'Passwords do not match' });
		if (password.length < 8) return fail(400, { password_error: 'Password must be at least 8 characters' });
		const { error } = await locals.supabase.auth.updateUser({ password });
		if (error) return fail(400, { password_error: error.message });
		return { password_saved: true };
	},

	delete_account: async ({ locals }) => {
		const { user } = await locals.safeGetSession();
		await locals.supabase.from('profiles').delete().eq('id', user!.id);
		await locals.supabase.auth.signOut();
		redirect(303, '/');
	},
};
