export type MilestoneLike = { completed: boolean }

export const milestoneTotal = (ms: MilestoneLike[]): number => ms.length

export const milestoneDone = (ms: MilestoneLike[]): number =>
	ms.filter((m) => m.completed).length

export const milestoneProgress = (ms: MilestoneLike[]): number =>
	ms.length ? Math.round((milestoneDone(ms) / ms.length) * 100) : 0
