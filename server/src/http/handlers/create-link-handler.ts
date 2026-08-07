import type { FastifyReply, FastifyRequest } from 'fastify'

import { type ApiError, createLinkBodySchema } from '../../contracts'
import type { CreateLinkUseCase } from '../../use-cases/create-link'
import { ShortCodeAlreadyExistsError } from '../../use-cases/errors'

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

    try {
      const link = await createLink(input.data)
      return reply.status(201).send(link)
    } catch (error) {
      if (error instanceof ShortCodeAlreadyExistsError) {
        const conflict: ApiError = {
          code: 'SHORT_CODE_ALREADY_EXISTS',
          message: error.message,
        }
        return reply.status(409).send(conflict)
      }

      throw error
    }
  }
}
