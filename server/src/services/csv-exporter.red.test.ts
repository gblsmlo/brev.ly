import { describe, expect, test } from 'bun:test'

type CsvExporter = {
  exportLinks(): Promise<{ content: string; fileName: string; reportUrl: string }>
}

async function loadExporter(): Promise<CsvExporter> {
  const modulePath = './csv-exporter'
  const module = (await import(modulePath)) as {
    createCsvExporter?: () => CsvExporter
  }

  if (!module.createCsvExporter) {
    throw new Error('RED: createCsvExporter is not implemented')
  }

  return module.createCsvExporter()
}

describe('CSV exporter RED contract', () => {
  test('BE-T15/BE-T20 emits the required CSV columns', async () => {
    const exporter = await loadExporter()
    const report = await exporter.exportLinks()

    expect(report.content.split('\n')[0]).toBe('original_url,short_url,access_count,created_at')
  })

  test('BE-T17 generates a unique report file name', async () => {
    const exporter = await loadExporter()
    const first = await exporter.exportLinks()
    const second = await exporter.exportLinks()

    expect(first.fileName).not.toBe(second.fileName)
    expect(first.reportUrl).toContain('/reports/')
  })
})
