import { describe, expect, test } from 'bun:test'

import { failure, success } from './result'

describe('Result', () => {
  test('creates a successful result', () => {
    expect(success({ id: 'link-id' })).toEqual({
      success: true,
      value: { id: 'link-id' },
    })
  })

  test('creates a failed result', () => {
    const error = new Error('known failure')

    expect(failure(error)).toEqual({ error, success: false })
  })
})
