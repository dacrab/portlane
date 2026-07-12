import { callEdgeFn } from '$lib/server/edge'

export async function createCheckoutSessionViaEdge(
	invoiceId: string,
	accessToken: string,
	origin: string,
	returnPath?: string,
): Promise<{ url: string } | { error: string; status: number }> {
	const result = await callEdgeFn<{ url: string }>(
		'create-checkout-session',
		accessToken,
		{ invoiceId, origin, returnPath },
	)
	if ('error' in result) return { error: result.error, status: result.status }
	return { url: result.data.url }
}
