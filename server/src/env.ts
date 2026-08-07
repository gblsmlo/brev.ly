import { createServerEnv } from './env-schema'

export { createServerEnv, type ServerEnv, serverEnvSchema } from './env-schema'

export const env = createServerEnv()
