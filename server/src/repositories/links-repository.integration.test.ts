import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test'

import { createDatabase, type Database } from '../database/client'
import { links } from '../database/schema'
import {
  DuplicateShortCodeRepositoryError,
  InvalidLinksCursorRepositoryError,
  LinkNotFoundRepositoryError,
} from './errors'
import { createLinksRepository } from './links-repository'
import type { LinksRepository } from './ports'

const describeIntegration = process.env.RUN_INTEGRATION_TESTS === 'true' ? describe : describe.skip

describeIntegration('createLinksRepository integration', () => {
  let db: Database
  let repository: LinksRepository
  let closeDatabase: () => Promise<void>

  beforeAll(() => {
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required for repository integration tests')
    }

    const database = createDatabase(databaseUrl)
    db = database.db
    closeDatabase = () => database.pool.end()
    repository = createLinksRepository({
      db,
      frontendUrl: 'http://localhost:5173',
    })
  })

  beforeEach(async () => {
    await db.delete(links)
  })

  afterAll(async () => {
    await closeDatabase()
  })

  test('BE-T01 creates and finds a link', async () => {
    const created = await repository.create({
      originalUrl: 'https://example.com',
      shortCode: 'example',
    })

    expect(created).toMatchObject({
      accessCount: 0,
      originalUrl: 'https://example.com',
      shortCode: 'example',
      shortUrl: 'http://localhost:5173/example',
    })
    expect(await repository.findByShortCode('example')).toEqual(created)
  })

  test('BE-T04 preserves the unique short-code constraint', async () => {
    await repository.create({ originalUrl: 'https://example.com/one', shortCode: 'duplicate' })

    await expect(
      repository.create({ originalUrl: 'https://example.com/two', shortCode: 'duplicate' }),
    ).rejects.toBeInstanceOf(DuplicateShortCodeRepositoryError)
  })

  test('BE-T05 deletes by short code', async () => {
    await repository.create({ originalUrl: 'https://example.com', shortCode: 'delete-me' })

    expect(await repository.deleteByShortCode('delete-me')).toBeTrue()
    expect(await repository.deleteByShortCode('delete-me')).toBeFalse()
  })

  test('BE-T10 lists by an opaque cursor without duplicates', async () => {
    for (const shortCode of ['first', 'second', 'third']) {
      await repository.create({ originalUrl: `https://example.com/${shortCode}`, shortCode })
    }

    const firstPage = await repository.list({ limit: 2 })

    if (!firstPage.nextCursor) {
      throw new Error('Expected a cursor for the second page')
    }

    const secondPage = await repository.list({ cursor: firstPage.nextCursor, limit: 2 })
    const ids = [...firstPage.items, ...secondPage.items].map((item) => item.id)

    expect(firstPage.items).toHaveLength(2)
    expect(firstPage.nextCursor).toBeString()
    expect(secondPage.items).toHaveLength(1)
    expect(new Set(ids).size).toBe(3)
  })

  test('BE-T13 preserves concurrent increments atomically', async () => {
    await repository.create({ originalUrl: 'https://example.com', shortCode: 'counter' })

    await Promise.all(Array.from({ length: 10 }, () => repository.incrementAccesses('counter')))

    expect((await repository.findByShortCode('counter'))?.accessCount).toBe(10)
  })

  test('returns controlled absence results for unknown links', async () => {
    expect(await repository.findByShortCode('not-found')).toBeNull()
    expect(await repository.deleteByShortCode('not-found')).toBeFalse()
    await expect(repository.incrementAccesses('not-found')).rejects.toBeInstanceOf(
      LinkNotFoundRepositoryError,
    )
  })

  test('rejects an invalid opaque cursor', async () => {
    await expect(repository.list({ cursor: 'invalid', limit: 20 })).rejects.toBeInstanceOf(
      InvalidLinksCursorRepositoryError,
    )
  })
})
