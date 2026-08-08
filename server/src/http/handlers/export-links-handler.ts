import type { FastifyReply, FastifyRequest } from 'fastify'

import { type ApiError, exportLinksResponseSchema } from '../../contracts'
import type { ExportLinksUseCase } from '../../use-cases/export-links'

export function makeExportLinksHandler(exportLinks: ExportLinksUseCase) {
  return async (_request: FastifyRequest, reply: FastifyReply) => {
    const result = await exportLinks()

    if (!result.success) {
      reply.log.error(result.error)
      const response: ApiError = {
        code: 'EXPORT_FAILED',
        message: result.error.message,
      }

      return reply.status(500).send(response)
    }

    const report = exportLinksResponseSchema.parse(result.value)
    return reply.status(201).send(report)
  }
}
