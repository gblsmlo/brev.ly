import { buildApp } from './app'
import { createDatabase } from './database/client'
import { env } from './env'
import { createLinksRepository } from './repositories'
import { createCloudflareR2ReportsStorage } from './services/cloudflare-r2-reports-storage'

const { db, pool } = createDatabase(env.DATABASE_URL)
const reportsStorage =
  env.CLOUDFLARE_ACCOUNT_ID &&
  env.CLOUDFLARE_ACCESS_KEY_ID &&
  env.CLOUDFLARE_SECRET_ACCESS_KEY &&
  env.CLOUDFLARE_BUCKET &&
  env.CLOUDFLARE_PUBLIC_URL
    ? createCloudflareR2ReportsStorage({
        accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
        accountId: env.CLOUDFLARE_ACCOUNT_ID,
        bucket: env.CLOUDFLARE_BUCKET,
        publicUrl: env.CLOUDFLARE_PUBLIC_URL,
        secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
      })
    : undefined
const app = await buildApp({
  corsOrigin: env.CORS_ORIGIN,
  repositories: {
    links: createLinksRepository({ db, frontendUrl: env.CORS_ORIGIN }),
  },
  services: { reportsStorage },
})

app.addHook('onClose', async () => pool.end())

await app.listen({
  host: '0.0.0.0',
  port: env.PORT,
})
