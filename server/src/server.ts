import { buildApp } from './app'
import { env } from './env'

const app = await buildApp({ corsOrigin: env.CORS_ORIGIN })

await app.listen({
  host: '0.0.0.0',
  port: env.PORT,
})
