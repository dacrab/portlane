import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { env } from '$env/dynamic/private'
import * as schema from './db/schema'

// Built on first use rather than at import, so tooling can import modules that
// depend on the database without runtime secrets configured.
let instance: ReturnType<typeof drizzle> | null = null

export function useDb() {
	if (!instance) {
		const url = env.DATABASE_URL
		if (!url) throw new Error('Missing DATABASE_URL')
		instance = drizzle(neon(url), { schema })
	}
	return instance
}
