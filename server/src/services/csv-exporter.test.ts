import { describe, expect, test } from 'bun:test'

import { InMemoryLinksRepository } from '../test/in-memory-links-repository'
import { InMemoryReportsStorage } from '../test/in-memory-reports-storage'
import { createCsvExporter } from './csv-exporter'

function makeExporter(createId: () => string = () => crypto.randomUUID()) {
  const linksRepository = new InMemoryLinksRepository()
  const reportsStorage = new InMemoryReportsStorage()
  const exporter = createCsvExporter({ createId, linksRepository, reportsStorage })

  return { exporter, linksRepository, reportsStorage }
}

describe('CSV exporter contract', () => {
  test('BE-T15/BE-T20 emits the required CSV columns', async () => {
    const { exporter, linksRepository, reportsStorage } = makeExporter()
    await linksRepository.create({
      originalUrl: 'https://example.com/articles/csv?filter=a,b',
      shortCode: 'csv-report',
    })
    const report = await exporter.exportLinks()

    expect(report.content.split('\n')[0]).toBe('original_url,short_url,access_count,created_at')
    expect(report.content).toContain('"https://example.com/articles/csv?filter=a,b"')
    expect(reportsStorage.uploads[0]).toMatchObject({
      content: report.content,
      contentType: 'text/csv; charset=utf-8',
    })
  })

  test('BE-T16 exports an empty collection with only the CSV header', async () => {
    const { exporter } = makeExporter()

    const report = await exporter.exportLinks()

    expect(report.content).toBe('original_url,short_url,access_count,created_at\n')
  })

  test('BE-T17 generates a unique report file name', async () => {
    let sequence = 0
    const { exporter } = makeExporter(() => `unique-${++sequence}`)
    const first = await exporter.exportLinks()
    const second = await exporter.exportLinks()

    expect(first.fileName).not.toBe(second.fileName)
    expect(first.fileName).toBe('unique-1.csv')
    expect(first.reportUrl).toContain('/reports/')
  })
})
