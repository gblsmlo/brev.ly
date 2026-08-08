import { describe, expect, test } from 'bun:test'

import { buildApp } from '../app'

describe('links export RED contract', () => {
  test('BE-T15–BE-T20 exports a public CSV report with required columns', async () => {
    const app = await buildApp({ corsOrigin: 'http://localhost:5173' })
    const response = await app.inject({ method: 'POST', url: '/links/export' })

    expect(response.statusCode).toBe(201)
    expect(response.json<{ reportUrl: string }>().reportUrl).toContain('/reports/')

    await app.close()
  })
})
