# Task 002 — Contratos Zod da API

## Objetivo

Transformar o contrato HTTP documentado em schemas executáveis e reutilizáveis pela API.

## Critérios de aceite

- [x] Schema único para o formato de `shortCode`.
- [x] URLs originais limitadas aos protocolos HTTP e HTTPS.
- [x] Schemas de criação, parâmetros, paginação e respostas.
- [x] Schema consistente de erro com códigos públicos conhecidos.
- [x] Objetos rejeitam campos desconhecidos.
- [x] Tipos TypeScript derivados exclusivamente com `z.infer`.
- [x] Testes cobrem sucesso, formatos inválidos, limites e respostas.
- [ ] Rotas Fastify consomem os schemas; será realizado junto à implementação dos endpoints.

## Evidência

- `server/src/contracts/links.ts`
- `server/src/contracts/errors.ts`
- `bun test server/src/contracts`
