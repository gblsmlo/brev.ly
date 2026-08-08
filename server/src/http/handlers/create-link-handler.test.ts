import { describe, expect, mock, test } from 'bun:test'
import Fastify from 'fastify'

import type { Link } from '../../contracts'
import { failure, success } from '../../shared/result'
import { ShortCodeAlreadyExistsError } from '../../use-cases/errors'
import { makeCreateLinkHandler } from './create-link-handler'

const link: Link = {
  accessCount: 0,
  createdAt: '2026-08-07T12:00:00.000Z',
  id: '87eea0af-54d6-4629-9af0-74588feebaac',
  originalUrl: 'https://example.com',
  shortCode: 'example',
  shortUrl: 'http://localhost:5173/example',
}

async function buildHandlerApp(createLink: ReturnType<typeof mock>) {
  const app = Fastify({ logger: false })
  app.post('/links', makeCreateLinkHandler(createLink))
  await app.ready()
  return app
}

describe('createLinkHandler', () => {
  test('returns 201 with the created link', async () => {
    const createLink = mock(async () => success(link))
    const app = await buildHandlerApp(createLink)

    const response = await app.inject({
      method: 'POST',
      payload: { originalUrl: link.originalUrl, shortCode: link.shortCode },
      url: '/links',
    })

    expect(response.statusCode).toBe(201)
    expect(response.json<Link>()).toEqual(link)
    expect(createLink).toHaveBeenCalledTimes(1)
    await app.close()
  })

  test('returns 400 without invoking the use case for invalid input', async () => {
    const createLink = mock(async () => success(link))
    const app = await buildHandlerApp(createLink)

    const response = await app.inject({
      method: 'POST',
      payload: { originalUrl: 'ftp://example.com', shortCode: 'has spaces' },
      url: '/links',
    })

    expect(response.statusCode).toBe(400)
    expect(response.json<{ code: string }>().code).toBe('VALIDATION_ERROR')
    expect(createLink).not.toHaveBeenCalled()
    await app.close()
  })

  test('maps an existing short code to 409', async () => {
    const createLink = mock(async () => failure(new ShortCodeAlreadyExistsError()))
    const app = await buildHandlerApp(createLink)

    const response = await app.inject({
      method: 'POST',
      payload: { originalUrl: link.originalUrl, shortCode: link.shortCode },
      url: '/links',
    })

    expect(response.statusCode).toBe(409)
    expect(response.json<{ code: string }>().code).toBe('SHORT_CODE_ALREADY_EXISTS')
    await app.close()
  })

  test('lets unexpected errors reach the Fastify error boundary', async () => {
    const createLink = mock(async () => {
      throw new Error('database unavailable')
    })
    const app = await buildHandlerApp(createLink)

    const response = await app.inject({
      method: 'POST',
      payload: { originalUrl: link.originalUrl, shortCode: link.shortCode },
      url: '/links',
    })

    expect(response.statusCode).toBe(500)
    await app.close()
  })
})
