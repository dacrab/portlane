type LocalUser = {
	userId: string
	email: string
	role: string
}

declare global {
	namespace App {
		interface Locals {
			user: LocalUser | null
		}
	}
}

export {}
