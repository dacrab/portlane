import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const form = await request.formData();
		const email_val = form.get('email');
		const email = typeof email_val === 'string' ? email_val.trim().toLowerCase() : '';
		const { error: resetErr } = await locals.supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${url.origin}/auth/callback?next=/reset-password`,
		});
		if (resetErr) return fail(400, { error: resetErr.message });
		return { sent: true };
	},
};
