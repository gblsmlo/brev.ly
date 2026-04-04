import { env } from '@infra/env'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	casing: 'snake_case',
	dbCredentials: {
		url: env.DATABASE_URL,
	},
	dialect: 'postgresql',
	out: './src/infra/db/migrations',
	schema: './src/infra/db/schemas/*',
})
