export {
  type BuildAppOptions,
  buildHttpApp,
} from './http/app'

import type { BuildAppOptions } from './http/app'
import { buildHttpApp } from './http/app'

export function buildApp(options: BuildAppOptions) {
  return buildHttpApp(options)
}
