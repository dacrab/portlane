import { describe, expect, it } from 'vitest'
import { milestoneDone, milestoneProgress, milestoneTotal } from './milestones'

const m = (completed: boolean) => ({ completed })

describe('milestone progress', () => {
	it('counts total and completed milestones', () => {
		const ms = [m(true), m(false), m(true)]
		expect(milestoneTotal(ms)).toBe(3)
		expect(milestoneDone(ms)).toBe(2)
	})

	it('computes a rounded percentage', () => {
		expect(milestoneProgress([m(true), m(false), m(false)])).toBe(33)
		expect(milestoneProgress([m(true), m(true), m(false), m(false)])).toBe(50)
	})

	it('returns 100 when all are done and 0 when none are', () => {
		expect(milestoneProgress([m(true), m(true)])).toBe(100)
		expect(milestoneProgress([m(false), m(false)])).toBe(0)
	})

	it('returns 0 for an empty list', () => {
		expect(milestoneProgress([])).toBe(0)
	})
})
