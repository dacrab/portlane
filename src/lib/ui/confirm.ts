import { toast } from 'svelte-sonner'

function confirmDelete(message: string, form: HTMLFormElement) {
	toast('Are you sure?', {
		description: message,
		action: { label: 'Delete', onClick: () => form.requestSubmit() },
		duration: 8000,
	})
}

/** `onclick` handler: confirms, then submits the button's enclosing form. */
export function confirmDeleteFromEvent(message: string, event: MouseEvent) {
	const target = event.currentTarget
	const form = target instanceof Element ? target.closest('form') : null
	if (form instanceof HTMLFormElement) confirmDelete(message, form)
}
