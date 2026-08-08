import { randomUUID } from 'node:crypto'

import type { Link } from '../contracts'
import type { LinksRepository } from '../repositories'
import type { ReportsStorage } from './reports-storage'

const CSV_HEADER = 'original_url,short_url,access_count,created_at'
const EXPORT_PAGE_SIZE = 100

interface CreateCsvExporterOptions {
  createId?: () => string
  linksRepository: LinksRepository
  reportsStorage: ReportsStorage
}

export interface CsvExportResult {
  content: string
  fileName: string
  reportUrl: string
}

function escapeCsvCell(value: string | number): string {
  const text = String(value)

  if (!/[",\n\r]/.test(text)) {
    return text
  }

  return `"${text.replaceAll('"', '""')}"`
}

function linkToCsvRow(link: Link): string {
  return [link.originalUrl, link.shortUrl, link.accessCount, link.createdAt]
    .map(escapeCsvCell)
    .join(',')
}

export function createCsvExporter({
  createId = randomUUID,
  linksRepository,
  reportsStorage,
}: CreateCsvExporterOptions) {
  return {
    async exportLinks(): Promise<CsvExportResult> {
      const rows = [CSV_HEADER]
      let cursor: string | undefined

      do {
        const page = await linksRepository.list({ cursor, limit: EXPORT_PAGE_SIZE })
        rows.push(...page.items.map(linkToCsvRow))
        cursor = page.nextCursor ?? undefined
      } while (cursor)

      const content = `${rows.join('\n')}\n`
      const fileName = `${createId()}.csv`
      const key = `reports/${fileName}`
      const uploaded = await reportsStorage.upload({
        content,
        contentType: 'text/csv; charset=utf-8',
        key,
      })

      return { content, fileName, reportUrl: uploaded.url }
    },
  }
}

export type CsvExporter = ReturnType<typeof createCsvExporter>
