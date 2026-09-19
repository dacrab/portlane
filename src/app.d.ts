type LocalUser = {
	userId: string
	email: string
	role: 'freelancer' | 'client'
}

declare global {
	namespace App {
		interface Locals {
			user: LocalUser | null
		}
	}
}

export {}
