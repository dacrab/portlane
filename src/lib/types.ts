import type { Database } from '$lib/database.types'

export type InvoiceJoined = Database['public']['Tables']['invoices']['Row'] & {
	projects: Pick<Database['public']['Tables']['projects']['Row'], 'name'> | null
	profiles: Pick<
		Database['public']['Tables']['profiles']['Row'],
		'full_name'
	> | null
}
