import { describe, expect, test } from 'bun:test'

import { buildApp } from './app'

describe('GET /health', () => {
  test('reports that the API is available', async () => {
    const app = await buildApp({ corsOrigin: 'http://localhost:5173' })

    const response = await app.inject({ method: 'GET', url: '/health' })

    expect(response.statusCode).toBe(200)
    expect(response.json<{ status: string }>()).toEqual({ status: 'ok' })

    await app.close()
  })

  test('registers repository dependencies at the HTTP composition boundary', async () => {
    const linksRepository = {
      create: async () => ({}),
      deleteByShortCode: async () => true,
      findByShortCode: async () => null,
      incrementAccesses: async () => ({ accessCount: 1 }),
      list: async () => ({ items: [], nextCursor: null }),
    }
    const app = await buildApp({
      corsOrigin: 'http://localhost:5173',
      repositories: { links: linksRepository },
    })

    expect(app.repositories.links).toBe(linksRepository)

    await app.close()
  })
})
