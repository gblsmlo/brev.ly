import type { FastifyReply, FastifyRequest } from 'fastify'

import { type ApiError, shortCodeParamsSchema } from '../../contracts'
import type { DeleteLinkUseCase } from '../../use-cases/delete-link'
import { LinkNotFoundError } from '../../use-cases/errors'

export function makeDeleteLinkHandler(deleteLink: DeleteLinkUseCase) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const params = shortCodeParamsSchema.safeParse(request.params)

    if (!params.success) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        message: 'O encurtamento informado é inválido.',
      } satisfies ApiError)
    }

    try {
      await deleteLink(params.data.shortCode)
      return reply.status(204).send()
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
