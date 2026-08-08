# Progresso do Brev.ly

## Estado atual

**Fase 5 — Aceitação e entrega**

## Fases

| Fase | Estado |
| --- | --- |
| 1. Fundação e contratos | Concluída |
| 2. Persistência e API | Concluída |
| 3. Interface SPA | Em andamento |
| 4. CSV e CDN | Concluída |
| 5. Aceitação e entrega | Em andamento |

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
- Sete testes de integração aprovados, incluindo cursor inválido e dez incrementos concorrentes.

### 2026-08-07 — Fluxo CRUD da API

- Implementados use cases e handlers para consultar, listar, excluir e incrementar links.
- Todas as entradas HTTP usam os contratos Zod e erros conhecidos retornam `400`, `404` ou `409`.
- A listagem expõe cursor opaco, limite validado e header `x-pagination-strategy: cursor`.
- BE-T01–BE-T14 e BE-T22 passaram; CSV/CDN e evidência `EXPLAIN ANALYZE` seguem pendentes.

### 2026-08-07 — Exportação CSV e Cloudflare R2

- Implementado `POST /links/export` no fluxo `route -> handler -> use-case -> service`.
- O exportador percorre todas as páginas do repository em lotes de 100 registros.
- O CSV aplica escaping e contém `original_url`, `short_url`, `access_count` e `created_at`.
- Cada objeto recebe o caminho `reports/<uuid>.csv` e é enviado por uma porta de storage.
- Criado adapter S3-compatible para Cloudflare R2 com URL pública da CDN.
- Testes unitários e HTTP validam conteúdo, upload, URL pública e nomes únicos sem chamadas de rede.
- Próxima ação: validar o adapter com credenciais R2 reais e registrar `EXPLAIN ANALYZE` da listagem.

### 2026-08-07 — Result Pattern

- Criado `Result<T, E>` como união discriminada com helpers `success` e `failure`.
- Todos os casos de uso passaram a explicitar sucessos e falhas previstas no tipo de retorno.
- Handlers agora traduzem resultados em respostas HTTP sem exceções como controle de fluxo.
- Falhas inesperadas continuam chegando ao error boundary do Fastify.
- Decisão e regras de adoção registradas no ADR 003 e no `AGENTS.md`.

### 2026-08-07 — Front-end SPA inicial

- Implementado cliente HTTP com validação Zod dos payloads e tratamento de erros da API.
- Criada a página `/` com formulário, listagem, empty state, loading, exclusão e download CSV.
- Criado o fluxo `GET /links/:shortCode` → `PATCH /links/:shortCode/accesses` → redirecionamento.
- Criada a página de recurso não encontrado para links inexistentes e rotas inválidas.
- Layout responsivo mobile-first implementado em CSS, com estados de ação bloqueada.
- As 14 jornadas Playwright FE-T01–FE-T14 passaram em Chromium.
- Próxima ação: revisar a fidelidade visual com o Figma e depois configurar o Cloudflare R2 real.

### 2026-08-07 — Aceitação de performance e CDN

- Configuradas as credenciais locais do Cloudflare R2 sem versionar segredos.
- `POST /links/export` retornou `201`, publicou o objeto e a URL pública retornou `200 OK` com
  `Content-Type: text/csv; charset=utf-8`.
- Criado BE-T21 com 10 mil registros e `EXPLAIN (ANALYZE, FORMAT JSON)`.
- O plano passou a usar o índice keyset após alinhar a consulta com `DESC NULLS LAST`.
- A integração PostgreSQL passou com oito cenários, incluindo performance.
- Pendência restante: revisão visual fiel ao Figma, que exige acesso autenticado neste ambiente.

### 2026-08-07

- Criada a fundação específica do desafio a partir de um workspace vazio.
- Lint, tipos, testes e builds locais concluídos com sucesso.
- Próxima ação: iniciar a tabela `links` e os casos de uso da Fase 2, começando pelos testes.
