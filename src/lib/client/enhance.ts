import type { SubmitFunction } from '@sveltejs/kit'
import { toast } from 'svelte-sonner'

export interface ToastEnhanceOptions {
	successMsg?: string
	errorMsg?: string
	/** Runs inside the result callback, right before `update()`. */
	beforeUpdate?: () => void
}

/**
 * Thin `use:enhance` wrapper that applies the default `update()` and shows a
 * success/error toast. Mirrors the common form pattern used across the app:
 * always update (following redirects), toast success on any non-error result,
 * toast the error detail on `failure`.
 */
export function toastEnhance(opts: ToastEnhanceOptions = {}): SubmitFunction {
	return () => {
		return async ({ result, update }) => {
			opts.beforeUpdate?.()
			await update()
			if (result.type === 'failure') {
				const detail = (result.data as { error?: string } | undefined)?.error
				toast.error(opts.errorMsg ?? detail ?? 'Something went wrong')
			} else if (opts.successMsg) {
				toast.success(opts.successMsg)
			}
		}
	}
}
