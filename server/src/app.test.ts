import { describe, expect, test } from 'bun:test'
import { buildApp } from './app'
import type { LinksRepository } from './repositories'

describe('GET /health', () => {
  test('reports that the API is available', async () => {
    const app = await buildApp({ corsOrigin: 'http://localhost:5173' })

    const response = await app.inject({ method: 'GET', url: '/health' })

    expect(response.statusCode).toBe(200)
    expect(response.json<{ status: string }>()).toEqual({ status: 'ok' })

    await app.close()
  })

  test('registers repository dependencies at the HTTP composition boundary', async () => {
    const link = {
      accessCount: 0,
      createdAt: '2026-08-07T12:00:00.000Z',
      id: '87eea0af-54d6-4629-9af0-74588feebaac',
      originalUrl: 'https://example.com',
      shortCode: 'example',
      shortUrl: 'http://localhost:5173/example',
    }
    const linksRepository = {
      create: async () => link,
      deleteByShortCode: async () => true,
      findByShortCode: async () => null,
      incrementAccesses: async () => ({ accessCount: 1, originalUrl: link.originalUrl }),
      list: async () => ({ items: [], nextCursor: null }),
    } satisfies LinksRepository
    const app = await buildApp({
      corsOrigin: 'http://localhost:5173',
      repositories: { links: linksRepository },
    })

    expect(app.repositories.links).toBe(linksRepository)

    await app.close()
  })

  test('composes the links route with the injected repository', async () => {
    const link = {
      accessCount: 0,
      createdAt: '2026-08-07T12:00:00.000Z',
      id: '87eea0af-54d6-4629-9af0-74588feebaac',
      originalUrl: 'https://example.com',
      shortCode: 'example',
      shortUrl: 'http://localhost:5173/example',
    }
    const linksRepository = {
      create: async () => link,
      deleteByShortCode: async () => true,
      findByShortCode: async () => null,
      incrementAccesses: async () => ({ accessCount: 1, originalUrl: link.originalUrl }),
      list: async () => ({ items: [], nextCursor: null }),
    } satisfies LinksRepository
    const app = await buildApp({
      corsOrigin: 'http://localhost:5173',
      repositories: { links: linksRepository },
    })

    const response = await app.inject({
      method: 'POST',
      payload: { originalUrl: link.originalUrl, shortCode: link.shortCode },
      url: '/links',
    })

    expect(response.statusCode).toBe(201)
    expect(response.json<typeof link>()).toEqual(link)
    await app.close()
  })
})
