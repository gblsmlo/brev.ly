import { z } from 'zod'

const emptyOrUrlSchema = z.union([z.literal(''), z.url()])

export const serverEnvSchema = z
  .object({
    CLOUDFLARE_ACCESS_KEY_ID: z.string().default(''),
    CLOUDFLARE_ACCOUNT_ID: z.string().default(''),
    CLOUDFLARE_BUCKET: z.string().default(''),
    CLOUDFLARE_PUBLIC_URL: emptyOrUrlSchema.default(''),
    CLOUDFLARE_SECRET_ACCESS_KEY: z.string().default(''),
    CORS_ORIGIN: z.url().default('http://localhost:5173'),
    DATABASE_URL: z.string().startsWith('postgresql://'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65_535).default(3333),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.NODE_ENV !== 'production') {
      return
    }

    const requiredCloudflareValues = [
      'CLOUDFLARE_ACCOUNT_ID',
      'CLOUDFLARE_ACCESS_KEY_ID',
      'CLOUDFLARE_SECRET_ACCESS_KEY',
      'CLOUDFLARE_BUCKET',
      'CLOUDFLARE_PUBLIC_URL',
    ] as const

    for (const key of requiredCloudflareValues) {
      if (!value[key]) {
        context.addIssue({
          code: 'custom',
          message: `${key} é obrigatório em produção.`,
          path: [key],
        })
      }
    }
  })

export type ServerEnv = z.infer<typeof serverEnvSchema>

export function createServerEnv(runtimeEnv: Record<string, unknown> = process.env): ServerEnv {
  return serverEnvSchema.parse({
    CLOUDFLARE_ACCESS_KEY_ID: runtimeEnv.CLOUDFLARE_ACCESS_KEY_ID,
    CLOUDFLARE_ACCOUNT_ID: runtimeEnv.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_BUCKET: runtimeEnv.CLOUDFLARE_BUCKET,
    CLOUDFLARE_PUBLIC_URL: runtimeEnv.CLOUDFLARE_PUBLIC_URL,
    CLOUDFLARE_SECRET_ACCESS_KEY: runtimeEnv.CLOUDFLARE_SECRET_ACCESS_KEY,
    CORS_ORIGIN: runtimeEnv.CORS_ORIGIN,
    DATABASE_URL: runtimeEnv.DATABASE_URL,
    NODE_ENV: runtimeEnv.NODE_ENV,
    PORT: runtimeEnv.PORT,
  })
}
