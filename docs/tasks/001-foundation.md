# Task 001 — Fundação do repositório

## Objetivo

Entregar uma base mínima, executável e rastreável que respeite a estrutura exigida pelo desafio.

## Critérios de aceite

- [x] Git inicializado na branch `main`.
- [x] Pastas raiz `web` e `server`.
- [x] React SPA com Vite, sem framework SSR.
- [x] Fastify, CORS, Drizzle e PostgreSQL declarados no back-end.
- [x] Script exato `db:migrate`.
- [x] Arquivos `.env.example` com todas as chaves obrigatórias.
- [x] Dockerfile multi-stage para a API.
- [x] Requisitos, API, arquitetura, decisão e progresso documentados.
- [x] Instalação reproduzível com lockfile.
- [x] Lint, typecheck, testes e builds aprovados.
- [x] Dockerfile multi-stage construído e validado com a execução do contêiner.
- [x] Primeiro commit preparado e criado como entrega desta tarefa.

## Evidências

- `bun install --frozen-lockfile`
- `bun run lint`
- `bun run typecheck`
- `bun run test` — 2 testes aprovados
- `bun run build` — web e server aprovados
- `docker build -f server/Dockerfile -t brevly-server:contracts .`
- `GET http://127.0.0.1:33330/health` no contêiner — `200 {"status":"ok"}`

## Fora de escopo

- Implementação das regras de links.
- Reprodução visual do Figma.
- Integração real com PostgreSQL ou Cloudflare R2.
