import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import type { FastifyInstance } from 'fastify'

import { buildApp } from '../app'
import type { Link, ListLinksResponse } from '../contracts'
import { InMemoryLinksRepository } from '../test/in-memory-links-repository'

const validLink = {
  originalUrl: 'https://example.com/articles/contract-first',
  shortCode: 'contract-first',
}

describe('links API contract', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = await buildApp({
      corsOrigin: 'http://localhost:5173',
      repositories: { links: new InMemoryLinksRepository() },
    })
  })

  afterEach(async () => {
    await app.close()
  })

  test('BE-T01 creates a link', async () => {
    const response = await app.inject({ method: 'POST', payload: validLink, url: '/links' })

    expect(response.statusCode).toBe(201)
    expect(response.json<Link>()).toMatchObject(validLink)
  })

  test.each([
    'has spaces',
    'path/segment',
    'ácento',
    'ab',
    'a'.repeat(31),
  ])('BE-T02 rejects malformed short code: %s', async (shortCode) => {
    const response = await app.inject({
      method: 'POST',
      payload: { ...validLink, shortCode },
      url: '/links',
    })

    expect(response.statusCode).toBe(400)
    expect(response.json<{ code: string }>().code).toBe('VALIDATION_ERROR')
  })

  test('BE-T03 rejects non-HTTP original URLs', async () => {
    const response = await app.inject({
      method: 'POST',
      payload: { ...validLink, originalUrl: 'ftp://example.com/file' },
      url: '/links',
    })

    expect(response.statusCode).toBe(400)
  })

  test('BE-T04 rejects duplicate short codes', async () => {
    await app.inject({ method: 'POST', payload: validLink, url: '/links' })
    const response = await app.inject({ method: 'POST', payload: validLink, url: '/links' })

    expect(response.statusCode).toBe(409)
    expect(response.json<{ code: string }>().code).toBe('SHORT_CODE_ALREADY_EXISTS')
  })

  test('BE-T05 deletes an existing link', async () => {
    await app.inject({ method: 'POST', payload: validLink, url: '/links' })
    const deleted = await app.inject({ method: 'DELETE', url: `/links/${validLink.shortCode}` })
    const lookup = await app.inject({ method: 'GET', url: `/links/${validLink.shortCode}` })

    expect(deleted.statusCode).toBe(204)
    expect(lookup.statusCode).toBe(404)
  })

  test('BE-T06 rejects invalid and missing deletion targets', async () => {
    const malformed = await app.inject({ method: 'DELETE', url: '/links/ab' })
    const missing = await app.inject({ method: 'DELETE', url: '/links/not-found' })

    expect(malformed.statusCode).toBe(400)
    expect(missing.statusCode).toBe(404)
  })

  test('BE-T07 resolves an existing short code', async () => {
    await app.inject({ method: 'POST', payload: validLink, url: '/links' })
    const response = await app.inject({ method: 'GET', url: `/links/${validLink.shortCode}` })

    expect(response.statusCode).toBe(200)
    expect(response.json<Link>().originalUrl).toBe(validLink.originalUrl)
  })

  test('BE-T08 returns a controlled error for an unknown short code', async () => {
    const response = await app.inject({ method: 'GET', url: '/links/not-found' })

    expect(response.statusCode).toBe(404)
    expect(response.json<{ code: string }>().code).toBe('LINK_NOT_FOUND')
  })

  test('rejects malformed lookup and increment parameters', async () => {
    const lookup = await app.inject({ method: 'GET', url: '/links/ab' })
    const increment = await app.inject({ method: 'PATCH', url: '/links/ab/accesses' })

    expect(lookup.statusCode).toBe(400)
    expect(increment.statusCode).toBe(400)
  })

  test('BE-T09 lists an empty collection', async () => {
    const response = await app.inject({ method: 'GET', url: '/links' })

    expect(response.statusCode).toBe(200)
    expect(response.json<ListLinksResponse>()).toEqual({ items: [], nextCursor: null })
  })

  test('BE-T10 lists links using a bounded cursor', async () => {
    for (const shortCode of ['first', 'second', 'third']) {
      await app.inject({
        method: 'POST',
        payload: { originalUrl: `https://example.com/${shortCode}`, shortCode },
        url: '/links',
      })
    }

    const first = await app.inject({ method: 'GET', url: '/links?limit=2' })
    const firstPage = first.json<ListLinksResponse>()
    const second = await app.inject({
      method: 'GET',
      url: `/links?limit=2&cursor=${firstPage.nextCursor}`,
    })

    expect(firstPage.items).toHaveLength(2)
    expect(firstPage.nextCursor).toBeString()
    expect(second.json<ListLinksResponse>().items).toHaveLength(1)
  })

  test.each(['0', '-1', '1.5', '101'])('BE-T11 rejects invalid limit: %s', async (limit) => {
    const response = await app.inject({ method: 'GET', url: `/links?limit=${limit}` })
    expect(response.statusCode).toBe(400)
  })

  test('BE-T12 increments accesses atomically', async () => {
    await app.inject({ method: 'POST', payload: validLink, url: '/links' })
    const response = await app.inject({
      method: 'PATCH',
      url: `/links/${validLink.shortCode}/accesses`,
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({ accessCount: 1, originalUrl: validLink.originalUrl })
  })

  test('BE-T13 preserves every concurrent increment', async () => {
    await app.inject({ method: 'POST', payload: validLink, url: '/links' })
    await Promise.all(
      Array.from({ length: 10 }, () =>
        app.inject({ method: 'PATCH', url: `/links/${validLink.shortCode}/accesses` }),
      ),
    )
    const response = await app.inject({ method: 'GET', url: `/links/${validLink.shortCode}` })

    expect(response.json<Link>().accessCount).toBe(10)
  })

  test('BE-T14 rejects access increments for unknown links', async () => {
    const response = await app.inject({ method: 'PATCH', url: '/links/not-found/accesses' })

    expect(response.statusCode).toBe(404)
    expect(response.json<{ code: string }>().code).toBe('LINK_NOT_FOUND')
  })

  test('rejects an invalid opaque cursor', async () => {
    const response = await app.inject({ method: 'GET', url: '/links?cursor=not-a-cursor' })
    expect(response.statusCode).toBe(400)
  })

  test('BE-T21 identifies cursor pagination', async () => {
    const response = await app.inject({ method: 'GET', url: '/links?limit=20' })

    expect(response.statusCode).toBe(200)
    expect(response.headers['x-pagination-strategy']).toBe('cursor')
  })

  test('BE-T22 responds to CORS preflight', async () => {
    const response = await app.inject({
      headers: {
        'access-control-request-method': 'POST',
        origin: 'http://localhost:5173',
      },
      method: 'OPTIONS',
      url: '/links',
    })

    expect(response.statusCode).toBe(204)
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
  })
})
