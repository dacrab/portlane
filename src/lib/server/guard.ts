import { fail } from '@sveltejs/kit'
import { isProjectClient, isProjectOwner } from '$lib/server/project'

type GuardResult =
	| { err: ReturnType<typeof fail>; userId?: never; projectId?: never }
	| { err?: never; userId: string; projectId: string }

export async function requireOwner(
	locals: App.Locals,
	projectId: string,
): Promise<GuardResult> {
	if (!locals.user) return { err: fail(401, { error: 'Not authenticated' }) }
	if (!(await isProjectOwner(projectId, locals.user.userId)))
		return { err: fail(403, { error: 'Not your project' }) }
	return { userId: locals.user.userId, projectId }
}

async function requireClient(
	locals: App.Locals,
	projectId: string,
): Promise<GuardResult> {
	if (!locals.user) return { err: fail(401, { error: 'Not authenticated' }) }
	if (!(await isProjectClient(projectId, locals.user.userId)))
		return { err: fail(403, { error: 'Not your project' }) }
	return { userId: locals.user.userId, projectId }
}

export async function requireClientFromUrl(
	locals: App.Locals,
	url: URL,
): Promise<GuardResult> {
	const projectId = url.searchParams.get('project')
	if (!projectId) return { err: fail(400, { error: 'Missing project' }) }
	return requireClient(locals, projectId)
}
