import cors from '@fastify/cors'
import Fastify from 'fastify'

interface BuildAppOptions {
  corsOrigin: string
}

export async function buildApp({ corsOrigin }: BuildAppOptions) {
  const app = Fastify({ logger: true })

  await app.register(cors, {
    origin: corsOrigin,
  })

  app.get('/health', async () => ({ status: 'ok' }))

  return app
}
