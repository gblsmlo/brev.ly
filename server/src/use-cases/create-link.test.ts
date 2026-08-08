import { describe, expect, mock, test } from 'bun:test'

import type { Link } from '../contracts'
import { DuplicateShortCodeRepositoryError, type LinksRepository } from '../repositories'
import { makeCreateLinkUseCase } from './create-link'

const link: Link = {
  accessCount: 0,
  createdAt: '2026-08-07T12:00:00.000Z',
  id: '87eea0af-54d6-4629-9af0-74588feebaac',
  originalUrl: 'https://example.com',
  shortCode: 'example',
  shortUrl: 'http://localhost:5173/example',
}

function makeRepository(overrides: Partial<LinksRepository> = {}): LinksRepository {
  return {
    create: mock(async () => link),
    deleteByShortCode: mock(async () => false),
    findByShortCode: mock(async () => null),
    incrementAccesses: mock(async () => ({ accessCount: 1, originalUrl: link.originalUrl })),
    list: mock(async () => ({ items: [], nextCursor: null })),
    ...overrides,
  }
}

describe('createLink use case', () => {
  test('creates a link when the short code is available', async () => {
    const repository = makeRepository()
    const createLink = makeCreateLinkUseCase(repository)

    const result = await createLink({
      originalUrl: link.originalUrl,
      shortCode: link.shortCode,
    })

    expect(result).toEqual({ success: true, value: link })
    expect(repository.findByShortCode).toHaveBeenCalledWith(link.shortCode)
    expect(repository.create).toHaveBeenCalledTimes(1)
  })

  test('rejects an existing short code without writing', async () => {
    const repository = makeRepository({ findByShortCode: mock(async () => link) })
    const createLink = makeCreateLinkUseCase(repository)

    const result = await createLink({ originalUrl: link.originalUrl, shortCode: link.shortCode })

    expect(result.success).toBeFalse()
    if (!result.success) {
      expect(result.error.name).toBe('ShortCodeAlreadyExistsError')
    }
    expect(repository.create).not.toHaveBeenCalled()
  })

  test('maps a concurrent database conflict to the domain error', async () => {
    const repository = makeRepository({
      create: mock(async () => {
        throw new DuplicateShortCodeRepositoryError()
      }),
    })
    const createLink = makeCreateLinkUseCase(repository)

    const result = await createLink({ originalUrl: link.originalUrl, shortCode: link.shortCode })

    expect(result.success).toBeFalse()
    if (!result.success) {
      expect(result.error.name).toBe('ShortCodeAlreadyExistsError')
    }
  })
})
