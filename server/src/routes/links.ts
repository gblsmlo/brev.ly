import type { FastifyPluginAsync } from 'fastify'

import { makeCreateLinkHandler } from '../http/handlers/create-link-handler'
import { makeCreateLinkUseCase } from '../use-cases/create-link'

export const linksRoute: FastifyPluginAsync = async (app) => {
  const linksRepository = app.repositories.links

  if (!linksRepository) {
    return
  }

  app.post('/links', makeCreateLinkHandler(makeCreateLinkUseCase(linksRepository)))
}
