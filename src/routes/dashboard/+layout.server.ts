import { redirect } from '@sveltejs/kit'
import { getUnreadComments } from '#lib/server/comments.js'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/login')
	if (locals.user.role === 'client') redirect(303, '/portal')

	const unreadCommentRows = await getUnreadComments(locals.user.userId)

	return {
		user: locals.user,
		unreadComments: unreadCommentRows.length,
		unreadCommentRows,
	}
}
