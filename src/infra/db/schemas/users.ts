import { randomUUID } from 'node:crypto'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
	_id: text('id')
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	email: text('email').unique(),
	name: text('name').notNull(),
	updatedAt: timestamp('updated_at').defaultNow(),
})
