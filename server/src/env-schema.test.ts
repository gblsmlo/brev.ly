import { describe, expect, test } from 'bun:test'

import { createServerEnv, serverEnvSchema } from './env-schema'

const databaseUrl = 'postgresql://postgres:postgres@localhost:5433/brevly_test'

describe('server environment schema', () => {
  test('parses development values and defaults optional settings', () => {
    expect(
      createServerEnv({
        DATABASE_URL: databaseUrl,
        NODE_ENV: 'test',
        PORT: '3333',
      }),
    ).toMatchObject({
      CLOUDFLARE_BUCKET: '',
      CORS_ORIGIN: 'http://localhost:5173',
      DATABASE_URL: databaseUrl,
      NODE_ENV: 'test',
      PORT: 3333,
    })
  })

  test('rejects invalid database URLs and ports', () => {
    expect(
      serverEnvSchema.safeParse({
        DATABASE_URL: 'sqlite://local.db',
        PORT: 3333,
      }).success,
    ).toBeFalse()
    expect(
      serverEnvSchema.safeParse({
        DATABASE_URL: databaseUrl,
        PORT: 70_000,
      }).success,
    ).toBeFalse()
  })

  test('requires the Cloudflare configuration in production', () => {
    expect(() =>
      createServerEnv({
        DATABASE_URL: databaseUrl,
        NODE_ENV: 'production',
        PORT: '3333',
      }),
    ).toThrow()
  })
})
