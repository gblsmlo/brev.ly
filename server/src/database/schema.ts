import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const links = pgTable(
  'links',
  {
    accessCount: integer('access_count').default(0).notNull(),
    createdAt: timestamp('created_at', { mode: 'date', precision: 3, withTimezone: true })
      .defaultNow()
      .notNull(),
    id: uuid('id').defaultRandom().primaryKey(),
    originalUrl: text('original_url').notNull(),
    shortCode: text('short_code').notNull().unique('links_short_code_unique'),
  },
  (table) => [index('links_created_at_id_idx').on(table.createdAt.desc(), table.id.desc())],
)

export type LinkRecord = typeof links.$inferSelect
export type NewLinkRecord = typeof links.$inferInsert
