import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();

	const { data: invoice } = await locals.supabase
		.from('invoices')
		.select('*, projects(name, description), profiles!invoices_freelancer_id_fkey(full_name), profiles!invoices_client_id_fkey(full_name)')
		.eq('id', params.id)
		.single();

	if (!invoice) error(404, 'Invoice not found');

	// Allow access to both freelancer and client
	if (invoice.freelancer_id !== user?.id && invoice.client_id !== user?.id) {
		error(403, 'Forbidden');
	}

	return { invoice };
};
