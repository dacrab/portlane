import { type Action, fail, type RequestEvent } from '@sveltejs/kit'
import type { SessionUser } from '#lib/domain/types.js'
import { requireClientFromUrl, requireOwner } from '#lib/server/guard.js'

export const DB_ERROR = 'Something went wrong. Please try again.'

type Result = unknown

interface AuthedContext {
	event: RequestEvent
	user: SessionUser
	form: FormData
}

interface ProjectContext extends AuthedContext {
	projectId: string
}

type Handler = (ctx: AuthedContext) => Result | Promise<Result>
type ProjectHandler = (ctx: ProjectContext) => Result | Promise<Result>

/** Runs an action with a guaranteed session and parsed form data. */
export function authed(handler: Handler): Action {
	return async (event) => {
		const user = event.locals.user
		if (!user) return fail(401, { error: 'Not authenticated' })
		return handler({
			event,
			user,
			form: await event.request.formData(),
		}) as ReturnType<Action>
	}
}

/** Runs an action after verifying the current user owns the project in `params.id`. */
export function ownerAction(handler: ProjectHandler): Action {
	return async (event) => {
		const user = event.locals.user
		if (!user) return fail(401, { error: 'Not authenticated' })

		const guard = await requireOwner(event.locals, event.params.id ?? '')
		if (guard.err) return guard.err

		return handler({
			event,
			user,
			form: await event.request.formData(),
			projectId: guard.projectId,
		}) as ReturnType<Action>
	}
}

/** Runs an action after verifying the current user is a client of `?project=`. */
export function clientAction(handler: ProjectHandler): Action {
	return async (event) => {
		const user = event.locals.user
		if (!user) return fail(401, { error: 'Not authenticated' })

		const guard = await requireClientFromUrl(event.locals, event.url)
		if (guard.err) return guard.err

		return handler({
			event,
			user,
			form: await event.request.formData(),
			projectId: guard.projectId,
		}) as ReturnType<Action>
	}
}
