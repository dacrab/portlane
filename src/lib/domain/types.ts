import type { InvoiceStatus, ProjectStatus } from './status.js'

export type UserRole = 'freelancer' | 'client'

export interface SessionUser {
	userId: string
	email: string
	role: UserRole
}

export interface Milestone {
	id: string
	projectId: string
	name: string
	completed: boolean
	position: number
}

export interface ProjectFile {
	id: string
	name: string
	storagePath: string
	sizeBytes: number | null
	createdAt: string
}

export interface ProjectComment {
	id: string
	body: string
	createdAt: string
	authorId: string
	name: string
}

export interface ProjectClient {
	id: string
	name: string
}

export interface TimeEntry {
	id: string
	minutes: number
	description: string | null
	loggedAt: string
}

export interface Project {
	id: string
	name: string
	description: string | null
	status: ProjectStatus
	dueDate: string | null
	freelancerName?: string
}

export interface Invoice {
	id: string
	amountCents: number
	currency: string
	status: InvoiceStatus
	dueDate: string | null
	createdAt: string
	stripeSessionId: string | null
}
