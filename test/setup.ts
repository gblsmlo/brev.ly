import { afterEach, mock } from 'bun:test'

import { createTestEnv } from './env-schema'

const env = createTestEnv()

for (const [key, value] of Object.entries(env)) {
  process.env[key] = String(value)
}

afterEach(() => {
  mock.restore()
})
