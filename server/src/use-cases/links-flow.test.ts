import { describe, expect, test } from 'bun:test'

import { InvalidLinksCursorRepositoryError } from '../repositories'
import { InMemoryLinksRepository } from '../test/in-memory-links-repository'
import { makeDeleteLinkUseCase } from './delete-link'
import { makeGetLinkUseCase } from './get-link'
import { makeIncrementLinkAccessUseCase } from './increment-link-access'
import { makeListLinksUseCase } from './list-links'

describe('links use cases', () => {
  test('gets and deletes an existing link', async () => {
    const repository = new InMemoryLinksRepository()
    const created = await repository.create({
      originalUrl: 'https://example.com',
      shortCode: 'one',
    })

    expect(await makeGetLinkUseCase(repository)('one')).toEqual({ success: true, value: created })
    expect(await makeDeleteLinkUseCase(repository)('one')).toEqual({
      success: true,
      value: undefined,
    })
    const missing = await makeGetLinkUseCase(repository)('one')
    expect(missing.success).toBeFalse()
  })

  test('rejects deletion of an unknown link', async () => {
    const repository = new InMemoryLinksRepository()

    const result = await makeDeleteLinkUseCase(repository)('missing')

    expect(result.success).toBeFalse()
    if (!result.success) {
      expect(result.error.name).toBe('LinkNotFoundError')
    }
  })

  test('increments an existing link and maps repository absence', async () => {
    const repository = new InMemoryLinksRepository()
    await repository.create({ originalUrl: 'https://example.com', shortCode: 'counter' })
    const increment = makeIncrementLinkAccessUseCase(repository)

    expect(await increment('counter')).toEqual({
      success: true,
      value: { accessCount: 1, originalUrl: 'https://example.com' },
    })
    expect((await increment('missing')).success).toBeFalse()
  })

  test('lists a page and maps an invalid repository cursor', async () => {
    const repository = new InMemoryLinksRepository()
    await repository.create({ originalUrl: 'https://example.com', shortCode: 'listed' })
    const list = makeListLinksUseCase(repository)

    const page = await list({ limit: 20 })
    expect(page.success).toBeTrue()
    if (page.success) {
      expect(page.value.items).toHaveLength(1)
    }
    const failingRepository = new InMemoryLinksRepository()
    failingRepository.list = async () => {
      throw new InvalidLinksCursorRepositoryError()
    }

    const invalidCursor = await makeListLinksUseCase(failingRepository)({ limit: 20 })
    expect(invalidCursor.success).toBeFalse()
    if (!invalidCursor.success) {
      expect(invalidCursor.error.name).toBe('InvalidLinksCursorError')
    }
  })
})
