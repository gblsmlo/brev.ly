import type { RouteHandler } from 'fastify'

import { type GetHealthUseCase, getHealth } from '../../use-cases/get-health'

export function makeHealthHandler(getHealthUseCase: GetHealthUseCase): RouteHandler {
  return async (_request, reply) => reply.status(200).send(getHealthUseCase())
}

export const healthHandler = makeHealthHandler(getHealth)
