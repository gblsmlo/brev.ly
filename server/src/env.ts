import { z } from 'zod'

const environmentSchema = z.object({
  CLOUDFLARE_ACCESS_KEY_ID: z.string(),
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  CLOUDFLARE_BUCKET: z.string(),
  CLOUDFLARE_PUBLIC_URL: z.string(),
  CLOUDFLARE_SECRET_ACCESS_KEY: z.string(),
  CORS_ORIGIN: z.url().default('http://localhost:5173'),
  DATABASE_URL: z.string().startsWith('postgresql://'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3333),
})

export const env = environmentSchema.parse(process.env)
