import { error, fail } from '@sveltejs/kit'
import type { SessionUser } from '#lib/domain/types.js'
import { isProjectClient, isProjectOwner } from '#lib/server/projects.js'

/** Returns the signed-in user or throws a 401 for loads behind an auth layout. */
export function requireUser(locals: App.Locals): SessionUser {
	if (!locals.user) error(401, 'Unauthorized')
	return locals.user
}

type GuardResult =
	| { err: ReturnType<typeof fail> }
	| { err?: never; userId: string; projectId: string }

type AccessCheck = (projectId: string, userId: string) => Promise<boolean>

async function requireProjectAccess(
	locals: App.Locals,
	projectId: string,
	hasAccess: AccessCheck,
): Promise<GuardResult> {
	if (!locals.user) return { err: fail(401, { error: 'Not authenticated' }) }
	if (!(await hasAccess(projectId, locals.user.userId)))
		return { err: fail(403, { error: 'Not your project' }) }
	return { userId: locals.user.userId, projectId }
}

export function requireOwner(
	locals: App.Locals,
	projectId: string,
): Promise<GuardResult> {
	return requireProjectAccess(locals, projectId, isProjectOwner)
}

export async function requireClientFromUrl(
	locals: App.Locals,
	url: URL,
): Promise<GuardResult> {
	const projectId = url.searchParams.get('project')
	if (!projectId) return { err: fail(400, { error: 'Missing project' }) }
	return requireProjectAccess(locals, projectId, isProjectClient)
}
