import type { FastifyReply, FastifyRequest } from 'fastify'

import { type ApiError, shortCodeParamsSchema } from '../../contracts'
import type { IncrementLinkAccessUseCase } from '../../use-cases/increment-link-access'

export function makeIncrementLinkAccessHandler(incrementLinkAccess: IncrementLinkAccessUseCase) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const params = shortCodeParamsSchema.safeParse(request.params)

    if (!params.success) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        message: 'O encurtamento informado é inválido.',
      } satisfies ApiError)
    }

    const result = await incrementLinkAccess(params.data.shortCode)

    if (!result.success) {
      return reply.status(404).send({
        code: 'LINK_NOT_FOUND',
        message: result.error.message,
      } satisfies ApiError)
    }

    return reply.status(200).send(result.value)
  }
}
