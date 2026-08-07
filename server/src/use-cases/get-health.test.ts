import { describe, expect, test } from 'bun:test'

import { getHealth, healthStatus } from './get-health'

describe('getHealth use case', () => {
  test('reports the application liveness state', () => {
    expect(getHealth()).toEqual({ status: 'ok' })
    expect(getHealth()).toBe(healthStatus)
  })
})
