export interface StoredObject {
	key: string
	uploadedAt: Date
}

export const ORPHAN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Pure orphan diff: stored objects that no DB row references and that are older
 * than `maxAgeMs` (grace period so an upload racing its INSERT isn't swept).
 */
export function findOrphanObjects(
	objects: StoredObject[],
	references: string[],
	now: Date,
	maxAgeMs: number = ORPHAN_MAX_AGE_MS,
): StoredObject[] {
	const referenced = new Set(references)
	const cutoff = now.getTime() - maxAgeMs
	return objects.filter(
		(o) => o.uploadedAt.getTime() <= cutoff && !referenced.has(o.key),
	)
}
