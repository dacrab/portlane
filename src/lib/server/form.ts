export const MIN_PASSWORD_LENGTH = 8

export const str = (f: FormData, k: string, d = ''): string => {
	const v = f.get(k)
	return typeof v === 'string' ? v.trim() : d
}

export const int = (f: FormData, k: string, d = 0): number => {
	const v = f.get(k)
	return typeof v === 'string' ? parseInt(v, 10) : d
}

export const num = (f: FormData, k: string, d = 0): number => {
	const v = f.get(k)
	return typeof v === 'string' ? parseFloat(v) : d
}

export const bool = (f: FormData, k: string): boolean => f.get(k) != null
