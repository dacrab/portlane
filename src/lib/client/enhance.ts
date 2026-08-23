import type { SubmitFunction } from '@sveltejs/kit'
import { toast } from 'svelte-sonner'

export interface ToastEnhanceOptions {
	successMsg?: string
	errorMsg?: string
	/** Runs on success, right before the default `update()` invalidation. */
	beforeUpdate?: () => void
}

function failMessage(
	data: Record<string, unknown> | undefined,
	fallback: string,
): string {
	return typeof data?.error === 'string' ? data.error : fallback
}

export function toastEnhance(opts: ToastEnhanceOptions = {}): SubmitFunction {
	return () => {
		return async ({ result, update }) => {
			if (result.type === 'failure') {
				const data = result.data as Record<string, unknown> | undefined
				toast.error(failMessage(data, opts.errorMsg ?? 'Something went wrong'))
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
				const data = result.data as Record<string, unknown> | undefined
				if (typeof data?.url === 'string') {
					window.location.href = data.url
					return
				}
			}
			if (result.type === 'failure') {
				const data = result.data as Record<string, unknown> | undefined
				toast.error(failMessage(data, 'Checkout failed'))
			} else if (result.type === 'error') {
				toast.error('Something went wrong')
			}
			await update()
		}
	}
}
