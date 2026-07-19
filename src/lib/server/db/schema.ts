import { sql } from 'drizzle-orm'
import {
	bigint,
	boolean,
	check,
	date,
	index,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from 'drizzle-orm/pg-core'
import { DEFAULT_CURRENCY } from '$lib/constants'

const genId = () => crypto.randomUUID()

export const users = pgTable(
	'user',
	{
		id: text('id').primaryKey().$defaultFn(genId),
		name: text('name').notNull(),
		email: text('email').notNull().unique(),
		emailVerified: boolean('email_verified').default(false).notNull(),
		image: text('image'),
		role: text('role').default('freelancer').notNull(),
		lastReadCommentsAt: timestamp('last_read_comments_at', {
			withTimezone: true,
			mode: 'string',
		}),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		check('user_role_check', sql`${table.role} IN ('freelancer', 'client')`),
	],
)

export const sessions = pgTable(
	'session',
	{
		id: text('id').primaryKey(),
		expiresAt: timestamp('expires_at').notNull(),
		token: text('token').notNull().unique(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
	},
	(table) => [index('session_userId_idx').on(table.userId)],
)

export const accounts = pgTable(
	'account',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: timestamp('access_token_expires_at'),
		refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
		scope: text('scope'),
		password: text('password'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
	},
	(table) => [index('account_userId_idx').on(table.userId)],
)

export const verifications = pgTable(
	'verification',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
	},
	(table) => [index('verification_identifier_idx').on(table.identifier)],
)

export const projects = pgTable(
	'project',
	{
		id: text('id').primaryKey().$defaultFn(genId),
		freelancerId: text('freelancer_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		description: text('description'),
		status: text('status').default('planning').notNull(),
		dueDate: date('due_date', { mode: 'string' }),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		check(
			'project_status_check',
			sql`${table.status} IN ('planning', 'in_progress', 'review', 'completed', 'archived')`,
		),
		index('idx_project_freelancer').on(table.freelancerId),
	],
)

export const projectClients = pgTable(
	'project_client',
	{
		projectId: text('project_id')
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		clientId: text('client_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
	},
	(table) => [
		primaryKey({ columns: [table.projectId, table.clientId] }),
		index('idx_project_client_client').on(table.clientId),
	],
)

export const milestones = pgTable(
	'milestone',
	{
		id: text('id').primaryKey().$defaultFn(genId),
		projectId: text('project_id')
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		completed: boolean('completed').default(false).notNull(),
		position: integer('position').default(0).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [index('idx_milestone_project').on(table.projectId)],
)

export const files = pgTable(
	'file',
	{
		id: text('id').primaryKey().$defaultFn(genId),
		projectId: text('project_id')
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		uploadedBy: text('uploaded_by')
			.notNull()
			.references(() => users.id),
		name: text('name').notNull(),
		storagePath: text('storage_path').notNull(),
		sizeBytes: bigint('size_bytes', { mode: 'number' }),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [index('idx_file_project').on(table.projectId)],
)

export const comments = pgTable(
	'comment',
	{
		id: text('id').primaryKey().$defaultFn(genId),
		projectId: text('project_id')
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		authorId: text('author_id')
			.notNull()
			.references(() => users.id),
		body: text('body').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [index('idx_comment_project').on(table.projectId)],
)

export const invoices = pgTable(
	'invoice',
	{
		id: text('id').primaryKey().$defaultFn(genId),
		projectId: text('project_id')
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		freelancerId: text('freelancer_id')
			.notNull()
			.references(() => users.id),
		clientId: text('client_id')
			.notNull()
			.references(() => users.id),
		amountCents: integer('amount_cents').notNull(),
		currency: text('currency').default(DEFAULT_CURRENCY).notNull(),
		status: text('status').default('draft').notNull(),
		dueDate: date('due_date', { mode: 'string' }),
		stripeSessionId: text('stripe_session_id'),
		stripePaymentIntentId: text('stripe_payment_intent_id'),
		lastReminderSentAt: timestamp('last_reminder_sent_at', {
			withTimezone: true,
			mode: 'string',
		}),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		check('invoice_amount_check', sql`${table.amountCents} > 0`),
		check(
			'invoice_status_check',
			sql`${table.status} IN ('draft', 'sent', 'paid', 'overdue')`,
		),
		index('idx_invoice_freelancer').on(table.freelancerId),
		index('idx_invoice_client').on(table.clientId),
	],
)

export const timeEntries = pgTable(
	'time_entry',
	{
		id: text('id').primaryKey().$defaultFn(genId),
		projectId: text('project_id')
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => users.id),
		description: text('description'),
		minutes: integer('minutes').notNull(),
		loggedAt: date('logged_at', { mode: 'string' }).defaultNow().notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		check('time_entry_minutes_check', sql`${table.minutes} > 0`),
		index('idx_time_entry_project').on(table.projectId),
	],
)

export const projectNotes = pgTable('project_note', {
	id: text('id').primaryKey().$defaultFn(genId),
	projectId: text('project_id')
		.unique()
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	body: text('body').notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
		.defaultNow()
		.notNull(),
})
