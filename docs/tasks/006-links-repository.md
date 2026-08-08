# Task 006 — Links repository com Drizzle

## Objetivo

Implementar a porta `LinksRepository` sobre PostgreSQL, preservando unicidade, operações atômicas
e paginação performática por cursor.

## Critérios de aceite

- [x] Tabela `links` possui UUID, URL original, código único, contador e data de criação.
- [x] Índice composto suporta a ordenação `created_at DESC, id DESC`.
- [x] Migration Drizzle reproduz o schema.
- [x] Repository cria, encontra e exclui por `shortCode`.
- [x] Incremento de acessos é atômico no PostgreSQL.
- [x] Listagem usa cursor opaco e limite, sem `OFFSET`.
- [x] Conflito concorrente de unicidade é traduzido para erro da aplicação.
- [x] Testes de integração executam contra o PostgreSQL efêmero.

## Evidências

- `server/src/database/schema.ts`
- `server/src/repositories/links-repository.ts`
- `server/src/repositories/links-repository.integration.test.ts`
- `server/drizzle/`
