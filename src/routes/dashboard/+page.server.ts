import { error } from '@sveltejs/kit'
import { getRecentComments, markCommentsRead } from '#lib/server/comments.js'
import { getDashboardStats } from '#lib/server/dashboard.js'
import { getDashboardProjects } from '#lib/server/projects.js'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) error(401)
	const userId = locals.user.userId

	const [projects, stats, activity] = await Promise.all([
		getDashboardProjects(userId),
		getDashboardStats(userId),
		getRecentComments(userId, 5),
	])

	const onboarding = {
		hasProject: projects.length > 0,
		hasClient: stats.totalClients > 0,
		hasInvoice: stats.totalInvoices > 0,
		hasProfile: !!stats.profileName.trim(),
	}

	return {
		projects,
		active: projects.filter((p) => p.status !== 'completed').length,
		completed: projects.filter((p) => p.status === 'completed').length,
		pending: projects.filter((p) => p.status === 'review').length,
		revenue: stats.revenue,
		activity,
		onboarding,
		onboardingDone: Object.values(onboarding).every(Boolean),
	}
}

export const actions: Actions = {
	mark_read: async ({ locals }) => {
		if (!locals.user) error(401)
		await markCommentsRead(locals.user.userId)
	},
}
