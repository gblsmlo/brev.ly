/**
 * Porta de persistência consumida pela camada HTTP.
 *
 * A implementação Drizzle/Postgres será adicionada na próxima etapa. Manter
 * esta interface fora das rotas permite testar os casos de uso sem acoplar o
 * Fastify ao driver de banco.
 */
export interface LinksRepository {
  create(input: { originalUrl: string; shortCode: string }): Promise<unknown>
  deleteByShortCode(shortCode: string): Promise<boolean>
  findByShortCode(shortCode: string): Promise<unknown | null>
  incrementAccesses(shortCode: string): Promise<{ accessCount: number }>
  list(input: {
    cursor?: string
    limit: number
  }): Promise<{ items: unknown[]; nextCursor: string | null }>
}

export interface AppRepositories {
  links: LinksRepository
}

export type RepositoryDependencies = Partial<AppRepositories>
