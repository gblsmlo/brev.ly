import { describe, expect, test } from 'bun:test'

import { createWebEnv, webEnvSchema } from './env-schema'

describe('web environment schema', () => {
  test('parses configured Vite origins', () => {
    expect(
      createWebEnv({
        VITE_BACKEND_URL: 'http://localhost:3333',
        VITE_FRONTEND_URL: 'http://localhost:5173',
      }),
    ).toEqual({
      VITE_BACKEND_URL: 'http://localhost:3333',
      VITE_FRONTEND_URL: 'http://localhost:5173',
    })
  })

  test('uses local defaults and rejects malformed origins', () => {
    expect(createWebEnv({})).toEqual({
      VITE_BACKEND_URL: 'http://localhost:3333',
      VITE_FRONTEND_URL: 'http://localhost:5173',
    })
    expect(webEnvSchema.safeParse({ VITE_BACKEND_URL: 'not-a-url' }).success).toBeFalse()
  })
})
