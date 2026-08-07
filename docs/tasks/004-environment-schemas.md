# Task 004 — Schemas separados de ambiente

## Objetivo

Validar configuração de API, SPA e testes no runtime correto, mantendo tipos inferidos dos
schemas Zod.

## Critérios de aceite

- [x] Schema Zod independente para server.
- [x] Schema Zod independente para web.
- [x] Schema Zod independente para testes.
- [x] Tipos derivados com `z.infer`.
- [x] Server rejeita configuração de produção sem Cloudflare completo.
- [x] Web valida URLs Vite ao iniciar a SPA.
- [x] Testes usam defaults determinísticos pelo preload.
- [x] Casos válidos e inválidos cobertos por testes.

## Evidências

- `server/src/env-schema.ts`
- `web/src/env-schema.ts`
- `test/env-schema.ts`
- `bun run test` — 21 testes aprovados
