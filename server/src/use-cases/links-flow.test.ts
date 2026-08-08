import { describe, expect, test } from 'bun:test'

import { InvalidLinksCursorRepositoryError } from '../repositories'
import { InMemoryLinksRepository } from '../test/in-memory-links-repository'
import { makeDeleteLinkUseCase } from './delete-link'
import { InvalidLinksCursorError, LinkNotFoundError } from './errors'
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

    expect(await makeGetLinkUseCase(repository)('one')).toEqual(created)
    await makeDeleteLinkUseCase(repository)('one')
    await expect(makeGetLinkUseCase(repository)('one')).rejects.toBeInstanceOf(LinkNotFoundError)
  })

  test('rejects deletion of an unknown link', async () => {
    const repository = new InMemoryLinksRepository()

    await expect(makeDeleteLinkUseCase(repository)('missing')).rejects.toBeInstanceOf(
      LinkNotFoundError,
    )
  })

  test('increments an existing link and maps repository absence', async () => {
    const repository = new InMemoryLinksRepository()
    await repository.create({ originalUrl: 'https://example.com', shortCode: 'counter' })
    const increment = makeIncrementLinkAccessUseCase(repository)

    expect(await increment('counter')).toEqual({
      accessCount: 1,
      originalUrl: 'https://example.com',
    })
    await expect(increment('missing')).rejects.toBeInstanceOf(LinkNotFoundError)
  })

  test('lists a page and maps an invalid repository cursor', async () => {
    const repository = new InMemoryLinksRepository()
    await repository.create({ originalUrl: 'https://example.com', shortCode: 'listed' })
    const list = makeListLinksUseCase(repository)

    expect((await list({ limit: 20 })).items).toHaveLength(1)
    const failingRepository = new InMemoryLinksRepository()
    failingRepository.list = async () => {
      throw new InvalidLinksCursorRepositoryError()
    }

    await expect(makeListLinksUseCase(failingRepository)({ limit: 20 })).rejects.toBeInstanceOf(
      InvalidLinksCursorError,
    )
  })
})
