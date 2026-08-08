import { buildApp } from './app'
import { createDatabase } from './database/client'
import { env } from './env'
import { createLinksRepository } from './repositories'

const { db, pool } = createDatabase(env.DATABASE_URL)
const app = await buildApp({
  corsOrigin: env.CORS_ORIGIN,
  repositories: {
    links: createLinksRepository({ db, frontendUrl: env.CORS_ORIGIN }),
  },
})

app.addHook('onClose', async () => pool.end())

await app.listen({
  host: '0.0.0.0',
  port: env.PORT,
})
