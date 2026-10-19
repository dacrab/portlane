import { describe, expect, it } from 'vitest'
import { findOrphanObjects, ORPHAN_MAX_AGE_MS } from './storage-sweep'

const now = new Date('2026-08-20T12:00:00Z')
const old = new Date(now.getTime() - ORPHAN_MAX_AGE_MS - 1000)
const fresh = new Date(now.getTime() - 60 * 1000)

const obj = (key: string, uploadedAt: Date) => ({ key, uploadedAt })

describe('findOrphanObjects', () => {
	it('deletes old objects with no matching reference', () => {
		const orphans = findOrphanObjects(
			[obj('p1/a.pdf', old), obj('p2/b.png', old)],
			['p1/a.pdf'],
			now,
		)
		expect(orphans.map((o) => o.key)).toEqual(['p2/b.png'])
	})

	it('keeps fresh unreferenced objects inside the grace period', () => {
		const orphans = findOrphanObjects([obj('p1/new.png', fresh)], [], now)
		expect(orphans).toEqual([])
	})

	it('keeps referenced objects regardless of order', () => {
		const orphans = findOrphanObjects(
			[obj('proj/x.zip', old)],
			['proj/x.zip'],
			now,
		)
		expect(orphans).toEqual([])
	})

	it('treats every unreferenced old object as an orphan', () => {
		const orphans = findOrphanObjects(
			[obj('p1/a.txt', old), obj('p1/b.txt', old)],
			['p1/c.txt'],
			now,
		)
		expect(orphans.map((o) => o.key)).toEqual(['p1/a.txt', 'p1/b.txt'])
	})

	it('treats an object exactly at the age boundary as sweepable', () => {
		const atBoundary = new Date(now.getTime() - ORPHAN_MAX_AGE_MS)
		const orphans = findOrphanObjects([obj('p1/old.bin', atBoundary)], [], now)
		expect(orphans).toHaveLength(1)
	})
})
