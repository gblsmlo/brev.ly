import type { FastifyReply, FastifyRequest } from 'fastify'

import { type ApiError, shortCodeParamsSchema } from '../../contracts'
import { LinkNotFoundError } from '../../use-cases/errors'
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

    try {
      return reply.status(200).send(await incrementLinkAccess(params.data.shortCode))
    } catch (error) {
      if (error instanceof LinkNotFoundError) {
        return reply.status(404).send({
          code: 'LINK_NOT_FOUND',
          message: error.message,
        } satisfies ApiError)
      }

      throw error
    }
  }
}
