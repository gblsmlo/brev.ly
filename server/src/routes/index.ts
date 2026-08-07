import type { FastifyInstance } from 'fastify'

import { healthRoute } from './health'
import { linksRoute } from './links'

export async function registerRoutes(app: FastifyInstance) {
  await app.register(healthRoute)
  await app.register(linksRoute)
}
