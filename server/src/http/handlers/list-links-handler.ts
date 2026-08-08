import type { FastifyReply, FastifyRequest } from 'fastify'

import { type ApiError, listLinksQuerySchema } from '../../contracts'
import { InvalidLinksCursorError } from '../../use-cases/errors'
import type { ListLinksUseCase } from '../../use-cases/list-links'

const invalidQueryError: ApiError = {
  code: 'VALIDATION_ERROR',
  message: 'Os parâmetros da listagem são inválidos.',
}

export function makeListLinksHandler(listLinks: ListLinksUseCase) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const query = listLinksQuerySchema.safeParse(request.query)

    if (!query.success) {
      return reply.status(400).send(invalidQueryError)
    }

    try {
      const page = await listLinks(query.data)
      return reply.header('x-pagination-strategy', 'cursor').status(200).send(page)
    } catch (error) {
      if (error instanceof InvalidLinksCursorError) {
        return reply
          .status(400)
          .send({ code: 'VALIDATION_ERROR', message: error.message } satisfies ApiError)
      }

      throw error
    }
  }
}
