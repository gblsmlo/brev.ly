import type { FastifyReply, FastifyRequest } from 'fastify'

import { type ApiError, shortCodeParamsSchema } from '../../contracts'
import type { DeleteLinkUseCase } from '../../use-cases/delete-link'

export function makeDeleteLinkHandler(deleteLink: DeleteLinkUseCase) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const params = shortCodeParamsSchema.safeParse(request.params)

    if (!params.success) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        message: 'O encurtamento informado é inválido.',
      } satisfies ApiError)
    }

    const result = await deleteLink(params.data.shortCode)

    if (!result.success) {
      return reply.status(404).send({
        code: 'LINK_NOT_FOUND',
        message: result.error.message,
      } satisfies ApiError)
    }

    return reply.status(204).send()
  }
}
