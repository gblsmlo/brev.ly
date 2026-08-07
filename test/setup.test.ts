import { describe, expect, test } from 'bun:test'

describe('Bun Test setup', () => {
  test('loads the deterministic test environment', () => {
    expect(process.env.NODE_ENV).toBe('test')
    expect(process.env.TZ).toBe('UTC')
  })
})
