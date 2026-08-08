# Progresso do Brev.ly

## Estado atual

**Fase 2 — Em andamento**

## Fases

| Fase | Estado |
| --- | --- |
| 1. Fundação e contratos | Concluída |
| 2. Persistência e API | Em andamento |
| 3. Interface SPA | Não iniciada |
| 4. CSV e CDN | Não iniciada |
| 5. Aceitação e entrega | Não iniciada |

## Fase 1

### Concluído

- Git inicializado na branch `main`.
- Estrutura raiz `web` e `server` criada.
- Contratos e plano inicial documentados.
- Escolha de identificador registrada no ADR 001.
- Dependências instaladas com lockfile reproduzível.
- Lint, typecheck, 2 testes e builds de produção aprovados.
- Dockerfile multi-stage revisado e preparado para o build de aceitação.
- Primeiro commit preparado com a fundação completa.

### Decisões

- Manter a entrega obrigatória como SPA Vite, sem SSR.
- Usar `shortCode` nas operações públicas.
- Usar paginação por cursor para a listagem.
- Manter funcionalidades extras fora da branch principal até a correção.

### Validação Docker concluída

- Imagem `brevly-server:contracts` construída com o Dockerfile multi-stage.
- Contêiner executado como usuário não privilegiado e `/health` respondeu `{"status":"ok"}`.
- Corrigida a ordem de `--cwd` nos scripts Bun após o primeiro build Docker revelar que o
  artefato `dist` não estava sendo gerado.

## Registro de sessões

### 2026-08-07 — Contratos da API

- Criados schemas Zod para links, criação, parâmetros, paginação, incremento, exportação e
  erros.
- Tipos públicos derivados dos schemas com `z.infer`, sem duplicação manual.
- Contratos fechados para rejeitar campos desconhecidos.
- Adicionados 13 testes de contrato para formatos válidos, erros e limites.
- Dockerfile construído e imagem validada por uma requisição real ao endpoint `/health`.
- Próxima ação: modelar a tabela `links` e integrar os schemas às rotas Fastify.

### 2026-08-07 — Setup de testes

- Centralizado o runner no `bun test` da raiz com preload global e isolamento por arquivo.
- Adicionados comandos de watch, cobertura e filtros para web, server e integração.
- Criado PostgreSQL efêmero e isolado para os próximos testes de repository.
- Documentadas convenções de nomes, responsabilidades e ciclo do banco de testes.

### 2026-08-07 — Schemas de ambiente

- Separados schemas Zod para server, web e testes.
- Tipos `ServerEnv`, `WebEnv` e `TestEnv` derivados com `z.infer`.
- Produção agora exige configuração completa do Cloudflare R2.
- O bootstrap da SPA valida as URLs Vite ao carregar.

### 2026-08-07 — Plano de testes funcional

- Criada matriz de testes BE-T01–BE-T22 e FE-T01–FE-T14.
- Definidos testes unitários, API, integração PostgreSQL, CDN, performance e navegador.
- Nenhum requisito de domínio foi marcado como aprovado antes da implementação.

### 2026-08-07 — Etapa RED

- Implementadas 22 especificações de API/persistência/exportação do back-end e 14 jornadas
  Playwright do front-end.
- Execução direcionada do back-end: 37 testes, 36 falhas esperadas e 1 aprovação (CORS preflight).
- O runner Playwright lista as 14 jornadas; a execução GREEN aguarda a SPA e a instalação do
  Chromium no ambiente.
- Próxima ação: implementar schema Drizzle, repository e rotas mantendo os testes como contrato.

### 2026-08-07 — Bootstrap Fastify

- Extraída a composição HTTP para `server/src/http/app.ts`.
- Centralizado o registro de rotas em `server/src/routes/index.ts`.
- Criada a primeira rota de liveness `GET /health`.
- Definidas as portas `LinksRepository` e `AppRepositories`, injetáveis no composition root.
- Próxima ação: implementar o adapter Drizzle/Postgres de `LinksRepository`.

### 2026-08-07 — Handlers e use cases

- Adotado `handler` como nome do adaptador HTTP; decisão registrada no ADR 002 e no `AGENTS.md`.
- Implementado o fluxo `route -> handler -> use-case` para health e criação inicial de links.
- A criação valida o contrato Zod e traduz duplicidade para HTTP `409`.
- A porta `LinksRepository` agora usa tipos inferidos dos schemas Zod.
- Testes unitários e HTTP cobrem handlers, use cases e a composição com repository injetado.
- Próxima ação: implementar e testar o adapter Drizzle/Postgres por trás da porta existente.

### 2026-08-07 — Infraestrutura local

- Adicionado `infra/dev/compose.yml` com PostgreSQL persistente para desenvolvimento.
- Separado o banco de desenvolvimento (`5432`) do banco efêmero de testes (`5433`).
- Criados os comandos `infra:dev`, `infra:down`, `infra:logs` e `dev:full`.

### 2026-08-07 — Repository de links

- Criado schema Drizzle com constraint única e índice composto para paginação por cursor.
- Geradas e aplicadas migrations nos bancos de desenvolvimento e testes.
- Implementado `createLinksRepository` com CRUD inicial, listagem keyset e incremento atômico.
- Traduzida a violação PostgreSQL `23505` para conflito conhecido pelo use case.
- Seis testes de integração aprovados, incluindo dez incrementos concorrentes.

### 2026-08-07

- Criada a fundação específica do desafio a partir de um workspace vazio.
- Lint, tipos, testes e builds locais concluídos com sucesso.
- Próxima ação: iniciar a tabela `links` e os casos de uso da Fase 2, começando pelos testes.
