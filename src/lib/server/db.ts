import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { DATABASE_URL } from '$app/env/private'
import * as schema from './db/schema'

const getDb = (() => {
	let instance: ReturnType<typeof drizzle> | null = null
	return () => {
		if (!instance) {
			const url = DATABASE_URL
			if (!url) throw new Error('Missing DATABASE_URL')
			const client = neon(url)
			instance = drizzle(client, { schema })
		}
		return instance
	}
})()

export function useDb() {
	return getDb()
}
