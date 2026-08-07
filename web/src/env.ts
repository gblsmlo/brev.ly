import { createWebEnv } from './env-schema'

export { createWebEnv, type WebEnv, webEnvSchema } from './env-schema'

export const webEnv = createWebEnv(import.meta.env)
