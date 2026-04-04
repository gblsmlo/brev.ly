import type { users } from '@infra/db/schemas'

export type User = typeof users.$inferSelect
export type UserInsert = typeof users.$inferInsert
export type UserUpdate = Partial<Pick<UserInsert, 'name' | 'email'>>
