export interface SweepBlob {
	pathname: string
	url: string
	uploadedAt: Date
}

export const ORPHAN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

/** Extracts a blob pathname from a stored reference; non-HTTP values (data URLs, junk) are ignored. */
function toPathname(reference: string): string | null {
	if (!/^https?:\/\//i.test(reference)) return null
	try {
		return decodeURIComponent(new URL(reference).pathname.replace(/^\//, ''))
	} catch {
		return null
	}
}

/**
 * Pure orphan-diff: blobs in the store that no DB row references and that are
 * older than `maxAgeMs` (grace period so an upload racing its INSERT isn't swept).
 */
export function findOrphanBlobs(
	blobs: SweepBlob[],
	references: string[],
	now: Date,
	maxAgeMs: number = ORPHAN_MAX_AGE_MS,
): SweepBlob[] {
	const referenced = new Set<string>()
	for (const ref of references) {
		const p = toPathname(ref)
		if (p) referenced.add(p)
	}
	const cutoff = now.getTime() - maxAgeMs
	return blobs.filter(
		(b) => b.uploadedAt.getTime() <= cutoff && !referenced.has(b.pathname),
	)
}
