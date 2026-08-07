import cors from '@fastify/cors'
import Fastify, { type FastifyInstance } from 'fastify'
import type { RepositoryDependencies } from '../repositories'
import { registerRoutes } from '../routes'

declare module 'fastify' {
  interface FastifyInstance {
    repositories: RepositoryDependencies
  }
}

export interface BuildAppOptions {
  corsOrigin: string
  repositories?: RepositoryDependencies
}

/**
 * Composition root HTTP da API.
 *
 * Plugins e rotas são registrados aqui; dependências de infraestrutura entram
 * por parâmetro para manter a aplicação testável e preparada para o Drizzle.
 */
export async function buildHttpApp({
  corsOrigin,
  repositories = {},
}: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: true })

  app.decorate('repositories', repositories)

  await app.register(cors, {
    origin: corsOrigin,
  })

  await registerRoutes(app)

  return app
}
