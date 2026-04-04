import { env } from '@infra/env'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schemas'

export const db = drizzle(env.DATABASE_URL, {
	casing: 'snake_case',
	logger: env.NODE_ENV === 'dev',
	schema,
})
