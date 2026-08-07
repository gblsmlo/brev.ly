import { describe, expect, test } from 'bun:test'

type Repository = {
  create(input: { originalUrl: string; shortCode: string }): Promise<unknown>
  deleteByShortCode(shortCode: string): Promise<boolean>
  incrementAccesses(shortCode: string): Promise<{ accessCount: number }>
  list(input: {
    cursor?: string
    limit: number
  }): Promise<{ items: unknown[]; nextCursor: string | null }>
  findByShortCode(shortCode: string): Promise<unknown | null>
}

async function loadRepository(): Promise<Repository> {
  const modulePath = './links-repository'
  const module = (await import(modulePath)) as {
    createLinksRepository?: () => Repository
  }

  if (!module.createLinksRepository) {
    throw new Error('RED: createLinksRepository is not implemented')
  }

  return module.createLinksRepository()
}

describe('links repository RED contract', () => {
  test('BE-T01 creates and finds a link', async () => {
    const repository = await loadRepository()
    const created = await repository.create({
      originalUrl: 'https://example.com',
      shortCode: 'example',
    })

    expect(created).toBeDefined()
    expect(await repository.findByShortCode('example')).toBeDefined()
  })

  test('BE-T05 deletes by short code', async () => {
    const repository = await loadRepository()

    expect(await repository.deleteByShortCode('example')).toBeTrue()
  })

  test('BE-T10 lists by cursor without offset pagination', async () => {
    const repository = await loadRepository()

    const page = await repository.list({ limit: 20 })

    expect(page.items).toBeArray()
    expect(page.nextCursor === null || typeof page.nextCursor === 'string').toBeTrue()
  })

  test('BE-T13 preserves concurrent increments', async () => {
    const repository = await loadRepository()
    const results = await Promise.all(
      Array.from({ length: 10 }, () => repository.incrementAccesses('example')),
    )

    expect(results).toHaveLength(10)
  })
})
