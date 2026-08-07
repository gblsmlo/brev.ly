# Arquitetura do server

O back-end usa um composition root HTTP para manter o Fastify desacoplado da persistência:

```text
server.ts
  └─ http/app.ts (CORS, plugins e dependências)
       └─ routes/index.ts
            └─ routes/health.ts
       └─ repositories/ports.ts (contratos de persistência)
```

## Responsabilidades

- `server/src/server.ts`: carrega ambiente e inicia o listener.
- `server/src/http/app.ts`: cria a instância Fastify, registra CORS, expõe dependências e compõe
  as rotas.
- `server/src/routes/index.ts`: ponto único de registro das rotas HTTP.
- `server/src/routes/health.ts`: liveness check `GET /health`, retornando `{ "status": "ok" }`.
- `server/src/repositories/ports.ts`: portas que a camada HTTP consumirá; a implementação
  Drizzle/Postgres entra por injeção em `buildApp({ repositories })`.

As rotas não devem importar o driver `pg` ou o schema Drizzle diretamente. A próxima etapa pode
implementar `createLinksRepository` atrás de `LinksRepository` sem alterar o bootstrap HTTP.
