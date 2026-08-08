import type { FastifyInstance } from 'fastify'

import { exportLinksRoute } from './export-links'
import { healthRoute } from './health'
import { linksRoute } from './links'

export async function registerRoutes(app: FastifyInstance) {
  await app.register(healthRoute)
  await app.register(linksRoute)
  await app.register(exportLinksRoute)
}
