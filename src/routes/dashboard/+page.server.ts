import { authed } from '#lib/server/action.js'
import { getRecentComments, markCommentsRead } from '#lib/server/comments.js'
import { getDashboardStats } from '#lib/server/dashboard.js'
import { requireUser } from '#lib/server/guard.js'
import { getDashboardProjects } from '#lib/server/projects.js'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals)

	const [projects, stats, activity] = await Promise.all([
		getDashboardProjects(user.userId),
		getDashboardStats(user.userId),
		getRecentComments(user.userId, 5),
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
	mark_read: authed(async ({ user }) => {
		await markCommentsRead(user.userId)
	}),
}
