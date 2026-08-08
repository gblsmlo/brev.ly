import { describe, expect, test } from 'bun:test'

import { buildApp } from '../app'
import { InMemoryLinksRepository } from '../test/in-memory-links-repository'
import { InMemoryReportsStorage } from '../test/in-memory-reports-storage'

describe('links export API contract', () => {
  test('BE-T15–BE-T20 exports a public CSV report with required columns', async () => {
    const linksRepository = new InMemoryLinksRepository()
    const reportsStorage = new InMemoryReportsStorage()
    await linksRepository.create({
      originalUrl: 'https://example.com/exported',
      shortCode: 'exported',
    })
    const app = await buildApp({
      corsOrigin: 'http://localhost:5173',
      repositories: { links: linksRepository },
      services: { reportsStorage },
    })
    const response = await app.inject({ method: 'POST', url: '/links/export' })

    expect(response.statusCode).toBe(201)
    expect(response.json<{ reportUrl: string }>().reportUrl).toContain('/reports/')
    expect(reportsStorage.uploads).toHaveLength(1)
    expect(reportsStorage.uploads[0]?.content).toContain(
      'original_url,short_url,access_count,created_at',
    )

    await app.close()
  })

  test('BE-T19 returns a controlled error when storage fails', async () => {
    const app = await buildApp({
      corsOrigin: 'http://localhost:5173',
      repositories: { links: new InMemoryLinksRepository() },
      services: {
        reportsStorage: {
          async upload() {
            throw new Error('storage unavailable')
          },
        },
      },
    })

    const response = await app.inject({ method: 'POST', url: '/links/export' })

    expect(response.statusCode).toBe(500)
    expect(response.json<{ code: string; message: string }>()).toEqual({
      code: 'EXPORT_FAILED',
      message: 'Não foi possível exportar os links.',
    })

    await app.close()
  })
})
