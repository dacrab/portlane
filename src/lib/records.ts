/** Narrow an unknown JSON value to a plain object; null for arrays and primitives. */
export function asRecord(value: unknown): Record<string, unknown> | null {
	if (typeof value !== 'object' || value === null || Array.isArray(value))
		return null
	return value as Record<string, unknown>
}
