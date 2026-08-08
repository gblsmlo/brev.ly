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

server.ts
  └─ routes/export-links.ts
       └─ http/handlers/export-links-handler.ts
            └─ use-cases/export-links.ts
                 └─ services/csv-exporter.ts
                      ├─ repositories/ports.ts
                      └─ services/reports-storage.ts
                           └─ services/cloudflare-r2-reports-storage.ts
```

## Responsabilidades

- `server/src/server.ts`: carrega ambiente e inicia o listener.
- `server/src/http/app.ts`: cria a instância Fastify, registra CORS, expõe dependências e compõe
  as rotas.
- `server/src/routes`: declara método/caminho e conecta cada rota ao seu handler.
- `server/src/http/handlers`: adapta requests, respostas, validação Zod e erros HTTP.
- `server/src/use-cases`: concentra ações e regras de negócio sem depender do Fastify.
- `server/src/shared/result.ts`: define a união discriminada usada pelos casos de uso para
  comunicar sucessos e falhas previstas sem exceções como controle de fluxo.
- `server/src/repositories/ports.ts`: define portas consumidas pelos use cases; a implementação
  Drizzle/Postgres entra por injeção em `buildApp({ repositories })`.
- `server/src/services`: contém regras reutilizáveis e portas para serviços externos. O exportador
  percorre a paginação por cursor, serializa o CSV e publica por `ReportsStorage`; o adapter R2
  implementa essa porta sem vazar o SDK da AWS para handlers ou casos de uso.
- `server/src/routes/health.ts`: declara o liveness check `GET /health`; o resultado
  `{ "status": "ok" }` nasce no use case e é enviado pelo handler.

As rotas e handlers não devem importar o driver `pg` ou o schema Drizzle diretamente. Os handlers
também não substituem os use cases: eles apenas traduzem HTTP para a aplicação.

## Result Pattern

Casos de uso retornam `Result<T, E>`. O handler verifica `success`, envia `value` no caminho
positivo e converte `error` para o status HTTP correspondente. Erros esperados de repository são
traduzidos pelo caso de uso; erros inesperados continuam sendo lançados para o error boundary do
Fastify. A decisão completa está no [ADR 003](decisions/003-result-pattern.md).

## Persistência de links

`createLinksRepository` recebe a conexão Drizzle e a URL pública do front-end por injeção. O
adapter concentra SQL, mapeamento de datas e URL curta, tradução de constraint única, incremento
atômico e paginação keyset por `(created_at, id)`. O pool PostgreSQL é criado no composition root e
encerrado no hook `onClose` do Fastify.
