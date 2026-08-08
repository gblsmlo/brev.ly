# Arquitetura do server

O back-end usa um composition root HTTP para manter o Fastify desacoplado da persistência:

```text
server.ts
  └─ http/app.ts (CORS, plugins e dependências)
       └─ routes/index.ts
            └─ routes/health.ts
                 └─ http/handlers/health-handler.ts
                      └─ use-cases/get-health.ts
                           └─ repositories/ports.ts
```

## Responsabilidades

- `server/src/server.ts`: carrega ambiente e inicia o listener.
- `server/src/http/app.ts`: cria a instância Fastify, registra CORS, expõe dependências e compõe
  as rotas.
- `server/src/routes`: declara método/caminho e conecta cada rota ao seu handler.
- `server/src/http/handlers`: adapta requests, respostas, validação Zod e erros HTTP.
- `server/src/use-cases`: concentra ações e regras de negócio sem depender do Fastify.
- `server/src/repositories/ports.ts`: define portas consumidas pelos use cases; a implementação
  Drizzle/Postgres entra por injeção em `buildApp({ repositories })`.
- `server/src/routes/health.ts`: declara o liveness check `GET /health`; o resultado
  `{ "status": "ok" }` nasce no use case e é enviado pelo handler.

As rotas e handlers não devem importar o driver `pg` ou o schema Drizzle diretamente. Os handlers
também não substituem os use cases: eles apenas traduzem HTTP para a aplicação. A próxima etapa
implementa novos casos de uso sobre `createLinksRepository` sem alterar o adapter HTTP ou o driver.

## Persistência de links

`createLinksRepository` recebe a conexão Drizzle e a URL pública do front-end por injeção. O
adapter concentra SQL, mapeamento de datas e URL curta, tradução de constraint única, incremento
atômico e paginação keyset por `(created_at, id)`. O pool PostgreSQL é criado no composition root e
encerrado no hook `onClose` do Fastify.
