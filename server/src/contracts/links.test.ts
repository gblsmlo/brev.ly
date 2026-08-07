import { describe, expect, test } from 'bun:test'

import {
  createLinkBodySchema,
  exportLinksResponseSchema,
  incrementLinkAccessResponseSchema,
  type Link,
  linkSchema,
  listLinksQuerySchema,
  listLinksResponseSchema,
  shortCodeParamsSchema,
} from './links'

const linkFixture = {
  accessCount: 0,
  createdAt: '2026-08-07T12:00:00.000Z',
  id: '0198f0a2-6be2-7000-8000-000000000001',
  originalUrl: 'https://example.com/articles/contract-first',
  shortCode: 'contract-first',
  shortUrl: 'https://brev.ly/contract-first',
} satisfies Link

describe('link contracts', () => {
  test('accepts a valid create-link body', () => {
    expect(
      createLinkBodySchema.parse({
        originalUrl: linkFixture.originalUrl,
        shortCode: linkFixture.shortCode,
      }),
    ).toEqual({
      originalUrl: linkFixture.originalUrl,
      shortCode: linkFixture.shortCode,
    })
  })

  test.each([
    'ab',
    'has spaces',
    'path/segment',
    'ácento',
    'a'.repeat(31),
  ])('rejects the malformed short code %s', (shortCode) => {
    expect(
      createLinkBodySchema.safeParse({
        originalUrl: linkFixture.originalUrl,
        shortCode,
      }).success,
    ).toBeFalse()
  })

  test('rejects non-HTTP original URLs and unknown fields', () => {
    expect(
      createLinkBodySchema.safeParse({
        originalUrl: 'ftp://example.com/file',
        shortCode: 'file',
      }).success,
    ).toBeFalse()

    expect(
      createLinkBodySchema.safeParse({
        originalUrl: linkFixture.originalUrl,
        shortCode: linkFixture.shortCode,
        unexpected: true,
      }).success,
    ).toBeFalse()
  })

  test('validates the public short-code parameter consistently', () => {
    expect(shortCodeParamsSchema.parse({ shortCode: 'my_link-01' })).toEqual({
      shortCode: 'my_link-01',
    })
    expect(shortCodeParamsSchema.safeParse({ shortCode: 'invalid/code' }).success).toBeFalse()
  })

  test('parses cursor pagination with a bounded default limit', () => {
    expect(listLinksQuerySchema.parse({})).toEqual({ limit: 20 })
    expect(listLinksQuerySchema.parse({ cursor: 'opaque-cursor', limit: '50' })).toEqual({
      cursor: 'opaque-cursor',
      limit: 50,
    })
    expect(listLinksQuerySchema.safeParse({ limit: '101' }).success).toBeFalse()
  })

  test('validates link, list, access increment and export responses', () => {
    expect(linkSchema.parse(linkFixture)).toEqual(linkFixture)
    expect(
      listLinksResponseSchema.parse({
        items: [linkFixture],
        nextCursor: null,
      }),
    ).toEqual({ items: [linkFixture], nextCursor: null })
    expect(
      incrementLinkAccessResponseSchema.parse({
        accessCount: 1,
        originalUrl: linkFixture.originalUrl,
      }),
    ).toEqual({ accessCount: 1, originalUrl: linkFixture.originalUrl })
    expect(
      exportLinksResponseSchema.parse({
        reportUrl: 'https://cdn.example.com/reports/0198f0a2-6be2-7000-8000-000000000001.csv',
      }),
    ).toEqual({
      reportUrl: 'https://cdn.example.com/reports/0198f0a2-6be2-7000-8000-000000000001.csv',
    })
  })

  test('rejects an invalid persisted link representation', () => {
    expect(linkSchema.safeParse({ ...linkFixture, accessCount: -1 }).success).toBeFalse()
    expect(linkSchema.safeParse({ ...linkFixture, createdAt: '07/08/2026' }).success).toBeFalse()
  })
})
