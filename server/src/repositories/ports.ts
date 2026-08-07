import type {
  CreateLinkBody,
  IncrementLinkAccessResponse,
  Link,
  ListLinksQuery,
  ListLinksResponse,
} from '../contracts'

/**
 * Porta de persistência consumida pelos use cases.
 *
 * A implementação Drizzle/Postgres será adicionada na próxima etapa. Manter
 * esta interface fora das rotas permite testar os casos de uso sem acoplar o
 * Fastify ao driver de banco.
 */
export interface LinksRepository {
  create(input: CreateLinkBody): Promise<Link>
  deleteByShortCode(shortCode: string): Promise<boolean>
  findByShortCode(shortCode: string): Promise<Link | null>
  incrementAccesses(shortCode: string): Promise<IncrementLinkAccessResponse>
  list(input: ListLinksQuery): Promise<ListLinksResponse>
}

export interface AppRepositories {
  links: LinksRepository
}

export type RepositoryDependencies = Partial<AppRepositories>
