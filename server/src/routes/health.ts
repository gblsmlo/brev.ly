import type { FastifyPluginAsync } from 'fastify'

import { healthHandler } from '../http/handlers/health-handler'

export const healthRoute: FastifyPluginAsync = async (app) => {
  app.get('/health', healthHandler)
}
