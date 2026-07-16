export const MIN_PASSWORD_LENGTH = 8

/** Generic error shown instead of leaking internal DB/Supabase error details. */
export const DB_ERROR = 'An unexpected error occurred. Please try again.'

function formVal(f: FormData, k: string): string | null {
	const v = f.get(k)
	return typeof v === 'string' ? v.trim() : null
}

export const str = (f: FormData, k: string, d = ''): string =>
	formVal(f, k) ?? d

export const int = (f: FormData, k: string, d = 0): number => {
	const v = formVal(f, k)
	if (v === null) return d
	const n = Number.parseInt(v, 10)
	return Number.isNaN(n) ? d : n
}

export const num = (f: FormData, k: string, d = 0): number => {
	const v = formVal(f, k)
	if (v === null) return d
	const n = Number.parseFloat(v)
	return Number.isNaN(n) ? d : n
}

export const formFile = (f: FormData, k: string): File | null => {
	const v = f.get(k)
	return v instanceof File ? v : null
}
