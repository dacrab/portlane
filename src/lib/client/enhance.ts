import type { SubmitFunction } from '@sveltejs/kit'
import { toast } from 'svelte-sonner'

export interface ToastEnhanceOptions {
	successMsg?: string
	errorMsg?: string
	/** Runs inside the result callback, right before `update()`. */
	beforeUpdate?: () => void
}

export function toastEnhance(opts: ToastEnhanceOptions = {}): SubmitFunction {
	return () => {
		return async ({ result, update }) => {
			opts.beforeUpdate?.()
			await update()
			if (result.type === 'failure') {
				const data = result.data as Record<string, unknown> | undefined
				const detail = typeof data?.error === 'string' ? data.error : undefined
				toast.error(opts.errorMsg ?? detail ?? 'Something went wrong')
			} else if (opts.successMsg) {
				toast.success(opts.successMsg)
			}
		}
	}
}
