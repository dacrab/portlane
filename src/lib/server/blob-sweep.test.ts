import { describe, expect, it } from 'vitest'
import { findOrphanBlobs, ORPHAN_MAX_AGE_MS } from './blob-sweep'

const now = new Date('2026-08-20T12:00:00Z')
const old = new Date(now.getTime() - ORPHAN_MAX_AGE_MS - 1000)
const fresh = new Date(now.getTime() - 60 * 1000)

const blob = (pathname: string, uploadedAt: Date) => ({
	pathname,
	url: `https://store.example.blob.vercel-storage.com/${pathname}`,
	uploadedAt,
})

describe('findOrphanBlobs', () => {
	it('deletes old blobs with no matching reference', () => {
		const orphans = findOrphanBlobs(
			[blob('p1/a.pdf', old), blob('p2/b.png', old)],
			['https://store.example.blob.vercel-storage.com/p1/a.pdf'],
			now,
		)
		expect(orphans.map((o) => o.pathname)).toEqual(['p2/b.png'])
	})

	it('keeps fresh unreferenced blobs inside the grace period', () => {
		const orphans = findOrphanBlobs([blob('p1/new.png', fresh)], [], now)
		expect(orphans).toEqual([])
	})

	it('matches referenced paths regardless of URL host', () => {
		const orphans = findOrphanBlobs(
			[blob('proj/x.zip', old)],
			[
				'https://other-store.us-east-1.blob.vercel-storage.com/proj/x.zip?download=1',
			],
			now,
		)
		expect(orphans).toEqual([])
	})

	it('ignores non-HTTP references like data URLs and bare strings', () => {
		const orphans = findOrphanBlobs(
			[blob('p1/a.txt', old)],
			['data:image/png;base64,AAAA', 'not-a-url'],
			now,
		)
		expect(orphans.map((o) => o.pathname)).toEqual(['p1/a.txt'])
	})

	it('treats a blob exactly at the age boundary as sweepable', () => {
		const atBoundary = new Date(now.getTime() - ORPHAN_MAX_AGE_MS)
		const orphans = findOrphanBlobs([blob('p1/old.bin', atBoundary)], [], now)
		expect(orphans).toHaveLength(1)
	})
})
