import { EDGE_FN_BASE } from '$lib/env'

export type EdgeResult<T> = { data: T } | { error: string; status: number }

export async function callEdgeFn<T>(
	path: string,
	token: string,
	body?: unknown,
): Promise<EdgeResult<T>> {
	const res = await fetch(`${EDGE_FN_BASE}/${path}`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: body === undefined ? undefined : JSON.stringify(body),
	})

	if (!res.ok) {
		const text = await res.text()
		let detail = text || `${path} failed`
		try {
			const parsed = JSON.parse(text) as { error?: string }
			if (parsed && typeof parsed.error === 'string') detail = parsed.error
		} catch {
			// keep raw text
		}
		return { error: detail, status: res.status }
	}

	return { data: (await res.json()) as T }
}
