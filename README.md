# Brev.ly

Aplicação full-stack para cadastrar, consultar, acessar, excluir e exportar links encurtados.
Este repositório contém os três escopos avaliados pelo desafio: front-end, back-end e DevOps.

## Estado do projeto

**Fase atual:** 2 — Persistência e API.

| Fase | Situação | Evidência |
| --- | --- | --- |
| 1. Fundação e contratos | Concluída | Estrutura, specs, testes e builds locais |
| 2. Persistência e API | Em andamento | CRUD completo; evidência de performance pendente |
| 3. Interface SPA | Em andamento | Jornadas FE-T01–FE-T14 aprovadas; revisão visual do Figma pendente |
| 4. CSV e CDN | Em andamento | CSV, rota e adapter R2 implementados; validação real pendente |
| 5. Aceitação e entrega | Não iniciada | — |

O acompanhamento detalhado está em [docs/PROGRESS.md](docs/PROGRESS.md). A rastreabilidade
entre enunciado, implementação e evidências está em
[docs/requirements.md](docs/requirements.md).

## Estrutura

```text
.
├── web/                    # React + TypeScript + Vite SPA
├── server/                 # Fastify + Drizzle + PostgreSQL
│   └── Dockerfile          # Imagem de produção da API
├── infra/                  # Infraestrutura local de desenvolvimento
│   └── dev/                # PostgreSQL via Docker Compose
├── docs/
│   ├── decisions/          # Decisões arquiteturais
│   ├── tasks/              # Fatias executáveis
│   ├── api-contract.md
│   ├── architecture.md
│   ├── IMPLEMENTATION.md
│   ├── PROGRESS.md
│   └── requirements.md
└── README.md
```

## Requisitos locais

- Bun 1.3.14
- PostgreSQL
- Docker, para executar a infraestrutura local ou a imagem da API

## Configuração

```bash
cp server/.env.example server/.env
cp web/.env.example web/.env
bun install
```

As chaves obrigatórias estão documentadas nos dois arquivos `.env.example`. Segredos e
arquivos `.env` reais não devem ser versionados.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `bun run dev` | Sobe PostgreSQL e executa web e server em modo de desenvolvimento |
| `bun run dev:full` | Alias para `bun run dev` |
| `bun run dev:web` | Executa somente a SPA |
| `bun run dev:server` | Executa somente a API |
| `bun run infra:dev` | Sobe o PostgreSQL de desenvolvimento |
| `bun run infra:down` | Para o PostgreSQL de desenvolvimento |
| `bun run infra:logs` | Exibe os logs do PostgreSQL |
| `bun run db:generate` | Gera migrations do Drizzle |
| `bun run db:migrate` | Executa as migrations do banco |
| `bun run lint` | Verifica lint e formatação |
| `bun run typecheck` | Verifica os tipos de todos os workspaces |
| `bun run test` | Executa os testes |
| `bun run test:watch` | Executa novamente os testes afetados por alterações |
| `bun run test:coverage` | Gera cobertura em texto e LCOV |
| `bun run test:server` | Executa somente os testes do back-end |
| `bun run test:web` | Executa somente os testes do front-end |
| `bun run test:integration` | Executa testes `*.integration.test.ts` com `.env.test` |
| `bun run build` | Gera os artefatos de produção |

## Contratos principais

- A URL curta usa o formato `https://<frontend>/<shortCode>`.
- `shortCode` é o identificador público usado para resolver, excluir e incrementar acessos.
- A listagem será paginada por cursor e ordenada por criação, evitando carregar toda a tabela.
- `POST /links/export` gera `reports/<uuid>.csv`, envia ao Cloudflare R2 e devolve a URL
  pública configurada em `CLOUDFLARE_PUBLIC_URL`.

Consulte [docs/api-contract.md](docs/api-contract.md) e a
[decisão de identificadores](docs/decisions/001-link-identifiers.md) antes de implementar os
endpoints.

A configuração, convenções e ambiente de testes estão em
[docs/testing.md](docs/testing.md).

Os contratos de configuração separados estão em
[docs/environment.md](docs/environment.md).

O plano de verificação funcional está em [docs/test-plan.md](docs/test-plan.md). Casos ainda
não implementados permanecem explicitamente como planejados.

## Escopo de correção

A branch principal preservará somente os requisitos obrigatórios do desafio. Melhorias como
SSR, OpenGraph, upload de imagens e interface otimista devem ser implementadas depois da
entrega ou em uma branch separada.
