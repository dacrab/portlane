import { EDGE_FN_BASE } from '$lib/env';

export async function createCheckoutSessionViaEdge(
	invoiceId: string,
	accessToken: string,
	origin: string,
	returnPath?: string,
): Promise<{ url: string } | { error: string; status: number }> {
	const res = await fetch(`${EDGE_FN_BASE}/create-checkout-session`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ invoiceId, origin, returnPath }),
	});

	if (!res.ok) {
		const text = await res.text();
		return { error: text || 'Checkout session creation failed', status: res.status };
	}

	const data = await res.json();
	return { url: data.url };
}
