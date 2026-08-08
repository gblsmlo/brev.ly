import type { FastifyReply, FastifyRequest } from 'fastify'

import { type ApiError, createLinkBodySchema } from '../../contracts'
import type { CreateLinkUseCase } from '../../use-cases/create-link'

const validationError: ApiError = {
  code: 'VALIDATION_ERROR',
  message: 'Os dados enviados para criação do link são inválidos.',
}

export function makeCreateLinkHandler(createLink: CreateLinkUseCase) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const input = createLinkBodySchema.safeParse(request.body)

    if (!input.success) {
      return reply.status(400).send(validationError)
    }

    const result = await createLink(input.data)

    if (!result.success) {
      const conflict: ApiError = {
        code: 'SHORT_CODE_ALREADY_EXISTS',
        message: result.error.message,
      }
      return reply.status(409).send(conflict)
    }

    return reply.status(201).send(result.value)
  }
}
