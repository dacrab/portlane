import type { SessionUser } from '#lib/domain/types.js'

declare global {
	namespace App {
		interface Locals {
			user: SessionUser | null
		}
	}
}
