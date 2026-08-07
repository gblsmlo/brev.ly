import { describe, expect, mock, test } from 'bun:test'
import Fastify from 'fastify'

import { makeHealthHandler } from './health-handler'

describe('healthHandler', () => {
  test('maps the health use case result to an HTTP response', async () => {
    const getHealth = mock(() => ({ status: 'ok' }) as const)
    const app = Fastify({ logger: false })
    app.get('/health', makeHealthHandler(getHealth))

    const response = await app.inject({ method: 'GET', url: '/health' })

    expect(response.statusCode).toBe(200)
    expect(response.json<{ status: string }>()).toEqual({ status: 'ok' })
    expect(getHealth).toHaveBeenCalledTimes(1)

    await app.close()
  })
})
