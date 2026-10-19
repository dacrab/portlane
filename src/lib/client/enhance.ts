import { toast } from 'svelte-sonner'
import { asRecord } from '#lib/records.js'
import type { SubmitFunction } from '$app/forms'

/** Submits the form with the given element id — e.g. from an `AppSelect` change handler. */
export function submitForm(id: string) {
	const form = document.getElementById(id)
	if (form instanceof HTMLFormElement) form.requestSubmit()
}

/** `onchange` handler for a hidden file input: submits its form once a file is picked. */
export function submitOnFilePick(event: Event) {
	const target = event.target
	if (target instanceof HTMLInputElement) target.form?.requestSubmit()
}

export interface ToastEnhanceOptions {
	successMsg?: string
	errorMsg?: string
	/** Runs on success, right before the default `update()` invalidation. */
	beforeUpdate?: () => void
}

function failMessage(data: unknown, fallback: string): string {
	const error = asRecord(data)?.error
	return typeof error === 'string' ? error : fallback
}

export function toastEnhance(opts: ToastEnhanceOptions = {}): SubmitFunction {
	return () => {
		return async ({ result, update }) => {
			if (result.type === 'failure') {
				toast.error(
					failMessage(result.data, opts.errorMsg ?? 'Something went wrong'),
				)
				await update()
			} else if (result.type === 'error') {
				toast.error('Something went wrong')
			} else {
				opts.beforeUpdate?.()
				await update()
				if (opts.successMsg) toast.success(opts.successMsg)
			}
		}
	}
}

/** Submits an invoice-checkout form and redirects to Stripe, surfacing failures as toasts. */
export function checkoutEnhance(): SubmitFunction {
	return () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				const url = asRecord(result.data)?.url
				if (typeof url === 'string') {
					window.location.href = url
					return
				}
			}
			if (result.type === 'failure') {
				toast.error(failMessage(result.data, 'Checkout failed'))
			} else if (result.type === 'error') {
				toast.error('Something went wrong')
			}
			await update()
		}
	}
}
