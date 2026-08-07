import { describe, expect, test } from 'bun:test'

import { type ApiError, apiErrorSchema } from './errors'

describe('API error contract', () => {
  test('accepts a known error without requiring implementation details', () => {
    const error = {
      code: 'SHORT_CODE_ALREADY_EXISTS',
      message: 'Já existe um link com esse encurtamento.',
    } satisfies ApiError

    expect(apiErrorSchema.parse(error)).toEqual(error)
  })

  test('rejects unknown error codes and fields', () => {
    expect(
      apiErrorSchema.safeParse({
        code: 'UNKNOWN_ERROR',
        message: 'Unknown',
      }).success,
    ).toBeFalse()
    expect(
      apiErrorSchema.safeParse({
        code: 'LINK_NOT_FOUND',
        debug: 'database details',
        message: 'Link não encontrado.',
      }).success,
    ).toBeFalse()
  })
})
