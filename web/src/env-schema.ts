import { z } from 'zod'

export const webEnvSchema = z
  .object({
    VITE_BACKEND_URL: z.url().default('http://localhost:3333'),
    VITE_FRONTEND_URL: z.url().default('http://localhost:5173'),
  })
  .strict()

export type WebEnv = z.infer<typeof webEnvSchema>

export function createWebEnv(runtimeEnv: Record<string, unknown>): WebEnv {
  return webEnvSchema.parse({
    VITE_BACKEND_URL: runtimeEnv.VITE_BACKEND_URL,
    VITE_FRONTEND_URL: runtimeEnv.VITE_FRONTEND_URL,
  })
}
