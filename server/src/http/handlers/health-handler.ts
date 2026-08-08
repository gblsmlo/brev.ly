import type { RouteHandler } from 'fastify'

import { type GetHealthUseCase, getHealth } from '../../use-cases/get-health'

export function makeHealthHandler(getHealthUseCase: GetHealthUseCase): RouteHandler {
  return async (_, reply) => {
    const result = getHealthUseCase()
    return reply.status(200).send(result.value)
  }
}

export const healthHandler = makeHealthHandler(getHealth)
