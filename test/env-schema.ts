import { z } from 'zod'

export const testEnvSchema = z
  .object({
    CLOUDFLARE_ACCESS_KEY_ID: z.string().default('test'),
    CLOUDFLARE_ACCOUNT_ID: z.string().default('test'),
    CLOUDFLARE_BUCKET: z.string().default('brevly-test'),
    CLOUDFLARE_PUBLIC_URL: z.url().default('https://cdn.test.example.com'),
    CLOUDFLARE_SECRET_ACCESS_KEY: z.string().default('test'),
    CORS_ORIGIN: z.url().default('http://localhost:5173'),
    DATABASE_URL: z
      .string()
      .startsWith('postgresql://')
      .default('postgresql://postgres:postgres@localhost:5433/brevly_test'),
    NODE_ENV: z.literal('test').default('test'),
    PORT: z.coerce.number().int().min(1).max(65_535).default(3333),
    TZ: z.literal('UTC').default('UTC'),
  })
  .strict()

export type TestEnv = z.infer<typeof testEnvSchema>

export function createTestEnv(runtimeEnv: Record<string, unknown> = process.env): TestEnv {
  return testEnvSchema.parse({
    CLOUDFLARE_ACCESS_KEY_ID: runtimeEnv.CLOUDFLARE_ACCESS_KEY_ID,
    CLOUDFLARE_ACCOUNT_ID: runtimeEnv.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_BUCKET: runtimeEnv.CLOUDFLARE_BUCKET,
    CLOUDFLARE_PUBLIC_URL: runtimeEnv.CLOUDFLARE_PUBLIC_URL,
    CLOUDFLARE_SECRET_ACCESS_KEY: runtimeEnv.CLOUDFLARE_SECRET_ACCESS_KEY,
    CORS_ORIGIN: runtimeEnv.CORS_ORIGIN,
    DATABASE_URL: runtimeEnv.DATABASE_URL,
    NODE_ENV: 'test',
    PORT: runtimeEnv.PORT,
    TZ: 'UTC',
  })
}
