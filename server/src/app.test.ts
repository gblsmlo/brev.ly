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
})
