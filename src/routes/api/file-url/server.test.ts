import { beforeEach, describe, expect, it, vi } from 'vitest'

const rows = vi.hoisted(() => ({ current: [] as { one: string }[] }))
const presign = vi.hoisted(() =>
	vi.fn(async (key: string) => `https://storage.test/${key}`),
)

vi.mock('#lib/server/db.js', () => ({
	useDb: () => ({
		select: () => ({
			from: () => ({
				leftJoin: () => ({
					where: () => ({ limit: async () => rows.current }),
				}),
			}),
		}),
	}),
}))

vi.mock('#lib/server/storage.js', () => ({ presignDownload: presign }))

const { GET } = await import('./+server')

const freelancer = {
	userId: 'user_1',
	email: 'a@example.com',
	role: 'freelancer' as const,
}

const request = (path: string | null, user: App.Locals['user'] = freelancer) =>
	GET({
		url: new URL(
			path === null
				? 'https://portal.test/api/file-url'
				: `https://portal.test/api/file-url?path=${encodeURIComponent(path)}`,
		),
		locals: { user },
	} as Parameters<typeof GET>[0])

const status = async (call: Promise<unknown> | Response) => {
	try {
		await call
	} catch (thrown) {
		return (thrown as { status: number }).status
	}
	return 200
}

beforeEach(() => {
	rows.current = []
	presign.mockClear()
})

describe('GET /api/file-url', () => {
	it('rejects anonymous callers', async () => {
		expect(await status(request('project_1/file.pdf', null))).toBe(401)
		expect(presign).not.toHaveBeenCalled()
	})

	it('rejects a missing path', async () => {
		expect(await status(request(null))).toBe(400)
		expect(presign).not.toHaveBeenCalled()
	})

	it('rejects a path without a project segment', async () => {
		expect(await status(request('/file.pdf'))).toBe(400)
		expect(presign).not.toHaveBeenCalled()
	})

	it('rejects callers outside the project', async () => {
		expect(await status(request('project_1/file.pdf'))).toBe(403)
		expect(presign).not.toHaveBeenCalled()
	})

	it('presigns a file for a project member', async () => {
		rows.current = [{ one: 'project_1' }]

		const response = await request('project_1/file.pdf')

		expect(response.status).toBe(200)
		expect(await response.json()).toEqual({
			url: 'https://storage.test/project_1/file.pdf',
		})
		expect(presign).toHaveBeenCalledWith('project_1/file.pdf')
	})
})
