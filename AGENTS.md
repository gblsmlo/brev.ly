# Convenções de arquitetura

Estas instruções se aplicam a todo o repositório.

## Fluxo do back-end

Toda funcionalidade HTTP deve seguir esta direção de dependências:

```text
route -> handler -> use-case -> repository
```

### Routes (`server/src/routes`)

- Declaram método, caminho e composição da rota Fastify.
- Associam uma rota ao handler correspondente.
- Não validam regras de negócio e não acessam banco de dados.

### Handlers (`server/src/http/handlers`)

- Adaptam HTTP para a aplicação.
- Leem `params`, `query`, `body` e headers.
- Validam entradas e saídas com os schemas Zod compartilhados.
- Traduzem resultados e erros conhecidos para status e payloads HTTP.
- Não implementam regras de negócio e não importam Drizzle ou `pg`.

### Use cases (`server/src/use-cases`)

- Implementam uma ação de negócio por arquivo.
- Recebem dados já validados e dependências por injeção.
- Coordenam repositories e serviços, sem conhecer Fastify.
- Não definem status HTTP, headers ou detalhes do banco de dados.
- Retornam `Result<T, E>` para sucessos e falhas previstas; exceções ficam reservadas para falhas
  inesperadas.

### Result (`server/src/shared/result.ts`)

- `success(value)` representa a saída válida do caso de uso.
- `failure(error)` representa uma falha conhecida que o handler deve traduzir.
- O discriminante `success` deve ser verificado antes de acessar `value` ou `error`.
- Não transforme indiscriminadamente todo erro inesperado em `failure`.

### Repositories (`server/src/repositories`)

- Definem portas de persistência consumidas pelos use cases.
- Implementações traduzem essas portas para Drizzle/Postgres.
- Não conhecem Fastify e não retornam respostas HTTP.
- Devem preservar operações atômicas e paginação por cursor quando exigidas pelo domínio.

### Services (`server/src/services`)

- Definem portas e adapters para integrações que não são persistência relacional.
- Regras reutilizáveis, como serialização CSV, permanecem independentes do Fastify.
- Integrações externas, como Cloudflare R2, entram por injeção e não são importadas pelos handlers.
- Testes devem substituir serviços externos por implementações em memória, sem realizar chamadas de rede.

### Contratos (`server/src/contracts`)

- São a fonte de verdade para validação Zod da API.
- Tipos públicos devem ser derivados com `z.infer`; não duplicar interfaces equivalentes.

## Testes

- Use cases devem possuir testes unitários sem Fastify ou banco real.
- Handlers e routes devem usar `Fastify.inject` para validar o contrato HTTP.
- Implementações de repository devem ter testes de integração com o PostgreSQL efêmero.
- Testes RED permanecem falhando até a implementação da funcionalidade correspondente.
