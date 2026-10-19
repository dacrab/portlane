import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { DATABASE_URL } from '$app/env/private'
import * as schema from './db/schema'

let instance: ReturnType<typeof drizzle> | null = null

export function useDb() {
	if (!instance) {
		const url = DATABASE_URL
		if (!url) throw new Error('Missing DATABASE_URL')
		instance = drizzle(neon(url), { schema })
	}
	return instance
}
