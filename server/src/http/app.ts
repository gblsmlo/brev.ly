import cors from '@fastify/cors'
import Fastify, { type FastifyInstance } from 'fastify'
import type { RepositoryDependencies } from '../repositories'
import { registerRoutes } from '../routes'
import type { ReportsStorage } from '../services/reports-storage'

export interface AppServices {
  reportsStorage: ReportsStorage
}

export type ServiceDependencies = Partial<AppServices>

declare module 'fastify' {
  interface FastifyInstance {
    repositories: RepositoryDependencies
    services: ServiceDependencies
  }
}

export interface BuildAppOptions {
  corsOrigin: string
  repositories?: RepositoryDependencies
  services?: ServiceDependencies
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
  services = {},
}: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: true })

  app.decorate('repositories', repositories)
  app.decorate('services', services)

  await app.register(cors, {
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    origin: corsOrigin,
  })

  await registerRoutes(app)

  return app
}
