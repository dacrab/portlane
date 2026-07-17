import { EDGE_FN_BASE } from '$lib/env'

type EdgeResult<T> = { data: T } | { error: string; status: number }

function parseEdgeError(text: string): string | undefined {
	try {
		const parsed: unknown = JSON.parse(text)
		if (parsed && typeof parsed === 'object' && 'error' in parsed) {
			const { error: err } = parsed as { error: unknown }
			if (typeof err === 'string') return err
		}
	} catch {}
	return undefined
}

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
		const detail = parseEdgeError(text) || text || `${path} failed`
		return { error: detail, status: res.status }
	}

	const json: unknown = await res.json()
	return { data: json as T }
}
