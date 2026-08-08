import type { FastifyPluginAsync } from 'fastify'

import { makeExportLinksHandler } from '../http/handlers/export-links-handler'
import { createCsvExporter } from '../services/csv-exporter'
import { makeExportLinksUseCase } from '../use-cases/export-links'

export const exportLinksRoute: FastifyPluginAsync = async (app) => {
  const linksRepository = app.repositories.links
  const reportsStorage = app.services.reportsStorage

  if (!linksRepository || !reportsStorage) {
    return
  }

  const csvExporter = createCsvExporter({ linksRepository, reportsStorage })
  app.post('/links/export', makeExportLinksHandler(makeExportLinksUseCase(csvExporter)))
}
