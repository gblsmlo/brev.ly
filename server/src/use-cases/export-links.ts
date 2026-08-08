import type { ExportLinksResponse } from '../contracts'
import type { CsvExporter } from '../services/csv-exporter'
import { failure, type Result, success } from '../shared/result'
import { ExportLinksError } from './errors'

export type ExportLinksUseCase = () => Promise<Result<ExportLinksResponse, ExportLinksError>>

export function makeExportLinksUseCase(csvExporter: CsvExporter): ExportLinksUseCase {
  return async () => {
    try {
      const report = await csvExporter.exportLinks()
      return success({ reportUrl: report.reportUrl })
    } catch (error) {
      return failure(new ExportLinksError(error))
    }
  }
}
