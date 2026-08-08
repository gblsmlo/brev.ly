import type { FastifyReply, FastifyRequest } from 'fastify'

import { type ApiError, listLinksQuerySchema } from '../../contracts'
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

    const result = await listLinks(query.data)

    if (!result.success) {
      return reply
        .status(400)
        .send({ code: 'VALIDATION_ERROR', message: result.error.message } satisfies ApiError)
    }

    return reply.header('x-pagination-strategy', 'cursor').status(200).send(result.value)
  }
}
