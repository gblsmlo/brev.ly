import { describe, expect, test } from 'bun:test'

import { getHealth, healthStatus } from './get-health'

describe('getHealth use case', () => {
  test('reports the application liveness state', () => {
    expect(getHealth()).toEqual({ success: true, value: { status: 'ok' } })
    expect(getHealth().value).toBe(healthStatus)
  })
})
