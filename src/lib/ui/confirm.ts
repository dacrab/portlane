import { toast } from 'svelte-sonner'

/** Toast-based delete confirmation */
export function confirmDelete(message: string, form: HTMLFormElement) {
	toast('Are you sure?', {
		description: message,
		action: { label: 'Delete', onClick: () => form.requestSubmit() },
		duration: 8000,
	})
}
