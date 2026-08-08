import type { FastifyReply, FastifyRequest } from 'fastify'

import { type ApiError, shortCodeParamsSchema } from '../../contracts'
import { LinkNotFoundError } from '../../use-cases/errors'
import type { GetLinkUseCase } from '../../use-cases/get-link'

const invalidParamsError: ApiError = {
  code: 'VALIDATION_ERROR',
  message: 'O encurtamento informado é inválido.',
}

export function makeGetLinkHandler(getLink: GetLinkUseCase) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const params = shortCodeParamsSchema.safeParse(request.params)

    if (!params.success) {
      return reply.status(400).send(invalidParamsError)
    }

    try {
      return reply.status(200).send(await getLink(params.data.shortCode))
    } catch (error) {
      if (error instanceof LinkNotFoundError) {
        const notFound: ApiError = { code: 'LINK_NOT_FOUND', message: error.message }
        return reply.status(404).send(notFound)
      }

      throw error
    }
  }
}
