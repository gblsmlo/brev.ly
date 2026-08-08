import type { FastifyPluginAsync } from 'fastify'

import { makeCreateLinkHandler } from '../http/handlers/create-link-handler'
import { makeDeleteLinkHandler } from '../http/handlers/delete-link-handler'
import { makeGetLinkHandler } from '../http/handlers/get-link-handler'
import { makeIncrementLinkAccessHandler } from '../http/handlers/increment-link-access-handler'
import { makeListLinksHandler } from '../http/handlers/list-links-handler'
import { makeCreateLinkUseCase } from '../use-cases/create-link'
import { makeDeleteLinkUseCase } from '../use-cases/delete-link'
import { makeGetLinkUseCase } from '../use-cases/get-link'
import { makeIncrementLinkAccessUseCase } from '../use-cases/increment-link-access'
import { makeListLinksUseCase } from '../use-cases/list-links'

export const linksRoute: FastifyPluginAsync = async (app) => {
  const linksRepository = app.repositories.links

  if (!linksRepository) {
    return
  }

  app.post('/links', makeCreateLinkHandler(makeCreateLinkUseCase(linksRepository)))
  app.get('/links', makeListLinksHandler(makeListLinksUseCase(linksRepository)))
  app.get('/links/:shortCode', makeGetLinkHandler(makeGetLinkUseCase(linksRepository)))
  app.delete('/links/:shortCode', makeDeleteLinkHandler(makeDeleteLinkUseCase(linksRepository)))
  app.patch(
    '/links/:shortCode/accesses',
    makeIncrementLinkAccessHandler(makeIncrementLinkAccessUseCase(linksRepository)),
  )
}
