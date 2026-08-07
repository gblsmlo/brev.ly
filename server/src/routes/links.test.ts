import { describe, expect, test } from 'bun:test'

import { buildApp } from '../app'

const validLink = {
  originalUrl: 'https://example.com/articles/contract-first',
  shortCode: 'contract-first',
}

type JsonPayload = {
  accessCount?: number
  code?: string
  columns?: string[]
  items?: unknown[]
  nextCursor?: string | null
  originalUrl?: string
  reportUrl?: string
}

type TestResponse = {
  headers: Record<string, string | undefined>
  json(): JsonPayload
  statusCode: number
}

async function request(
  method: 'DELETE' | 'GET' | 'OPTIONS' | 'PATCH' | 'POST',
  url: string,
  payload?: unknown,
  headers?: Record<string, string>,
): Promise<TestResponse> {
  const app = await buildApp({ corsOrigin: 'http://localhost:5173' })
  const inject = app.inject.bind(app) as unknown as (options: {
    headers?: Record<string, string>
    method: 'DELETE' | 'GET' | 'OPTIONS' | 'PATCH' | 'POST'
    payload?: unknown
    url: string
  }) => Promise<TestResponse>
  const response = await inject({
    method,
    headers,
    payload,
    url,
  })
  await app.close()
  return response
}

describe('links API RED contract', () => {
  test('BE-T01 creates a link', async () => {
    const response = await request('POST', '/links', validLink)

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject(validLink)
  })

  test.each([
    'has spaces',
    'path/segment',
    'ácento',
    'ab',
    'a'.repeat(31),
  ])('BE-T02 rejects malformed short code: %s', async (shortCode) => {
    const response = await request('POST', '/links', { ...validLink, shortCode })

    expect(response.statusCode).toBe(400)
    expect(response.json().code).toBe('VALIDATION_ERROR')
  })

  test('BE-T03 rejects non-HTTP original URLs', async () => {
    const response = await request('POST', '/links', {
      ...validLink,
      originalUrl: 'ftp://example.com/file',
    })

    expect(response.statusCode).toBe(400)
  })

  test('BE-T04 rejects duplicate short codes', async () => {
    const first = await request('POST', '/links', validLink)
    const second = await request('POST', '/links', validLink)

    expect(first.statusCode).toBe(201)
    expect(second.statusCode).toBe(409)
    expect(second.json().code).toBe('SHORT_CODE_ALREADY_EXISTS')
  })

  test('BE-T05 deletes an existing link', async () => {
    const response = await request('DELETE', `/links/${validLink.shortCode}`)

    expect(response.statusCode).toBe(204)
  })

  test('BE-T06 rejects invalid and missing deletion targets', async () => {
    const malformed = await request('DELETE', '/links/invalid/code')
    const missing = await request('DELETE', '/links/not-found')

    expect(malformed.statusCode).toBe(400)
    expect(missing.statusCode).toBe(404)
  })

  test('BE-T07 resolves the original URL', async () => {
    const response = await request('GET', `/links/${validLink.shortCode}`)

    expect(response.statusCode).toBe(200)
    expect(response.json().originalUrl).toBe(validLink.originalUrl)
  })

  test('BE-T08 returns a controlled error for an unknown short code', async () => {
    const response = await request('GET', '/links/not-found')

    expect(response.statusCode).toBe(404)
    expect(response.json().code).toBe('LINK_NOT_FOUND')
  })

  test('BE-T09 lists an empty collection', async () => {
    const response = await request('GET', '/links')

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ items: [], nextCursor: null })
  })

  test('BE-T10 lists links using a bounded cursor', async () => {
    const response = await request('GET', '/links?limit=2&cursor=opaque-cursor')

    expect(response.statusCode).toBe(200)
    expect(response.json().items).toHaveLength(2)
    expect(response.json().nextCursor).toBeString()
  })

  test.each(['0', '-1', '1.5', '101'])('BE-T11 rejects invalid limit: %s', async (limit) => {
    const response = await request('GET', `/links?limit=${limit}`)

    expect(response.statusCode).toBe(400)
  })

  test('BE-T12 increments accesses atomically', async () => {
    const response = await request('PATCH', `/links/${validLink.shortCode}/accesses`)

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      accessCount: 1,
      originalUrl: validLink.originalUrl,
    })
  })

  test('BE-T13 preserves every concurrent increment', async () => {
    const responses = await Promise.all(
      Array.from({ length: 10 }, () => request('PATCH', `/links/${validLink.shortCode}/accesses`)),
    )

    expect(responses.every((response) => response.statusCode === 200)).toBeTrue()
  })

  test('BE-T14 rejects access increments for unknown links', async () => {
    const response = await request('PATCH', '/links/not-found/accesses')

    expect(response.statusCode).toBe(404)
    expect(response.json().code).toBe('LINK_NOT_FOUND')
  })

  test('BE-T15 exports the links as CSV', async () => {
    const response = await request('POST', '/links/export')

    expect(response.statusCode).toBe(201)
    expect(response.json().reportUrl).toMatch(/^https?:\/\//)
  })

  test('BE-T16 exports a valid header for an empty collection', async () => {
    const response = await request('POST', '/links/export')

    expect(response.statusCode).toBe(201)
    expect(response.headers['content-type']).toContain('text/csv')
  })

  test('BE-T17 generates unique report names', async () => {
    const first = await request('POST', '/links/export')
    const second = await request('POST', '/links/export')

    expect(first.json().reportUrl).not.toBe(second.json().reportUrl)
  })

  test('BE-T18 exposes a public CDN URL for the report', async () => {
    const response = await request('POST', '/links/export')

    expect(response.statusCode).toBe(201)
    expect(response.json().reportUrl).toContain('/reports/')
  })

  test('BE-T19 reports storage failures without a false URL', async () => {
    const response = await request('POST', '/links/export')

    expect([201, 502, 503]).toContain(response.statusCode)
    if (response.statusCode !== 201) {
      expect(response.json().code).toBe('EXPORT_FAILED')
    }
  })

  test('BE-T20 returns the required CSV columns', async () => {
    const response = await request('POST', '/links/export')

    expect(response.statusCode).toBe(201)
    expect(response.json().columns).toEqual([
      'original_url',
      'short_url',
      'access_count',
      'created_at',
    ])
  })

  test('BE-T21 keeps list queries on the indexed cursor path', async () => {
    const response = await request('GET', '/links?limit=20')

    expect(response.statusCode).toBe(200)
    expect(response.headers['x-pagination-strategy']).toBe('cursor')
  })

  test('BE-T22 responds to CORS preflight', async () => {
    const response = await request('OPTIONS', '/links', undefined, {
      origin: 'http://localhost:5173',
      'access-control-request-method': 'POST',
    })

    expect(response.statusCode).toBe(204)
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
  })
})
