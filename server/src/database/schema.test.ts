import { describe, expect, test } from 'bun:test'

import { links } from './schema'

describe('Drizzle links schema', () => {
  test('BE-T04 has a unique short code column', () => {
    expect(links.shortCode.isUnique).toBeTrue()
    expect(links.shortCode.uniqueName).toBe('links_short_code_unique')
  })

  test('BE-T12 persists a non-null access counter', () => {
    expect(links.accessCount.notNull).toBeTrue()
    expect(links.accessCount.default).toBe(0)
  })
})
