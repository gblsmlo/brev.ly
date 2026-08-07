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

### Repositories (`server/src/repositories`)

- Definem portas de persistência consumidas pelos use cases.
- Implementações traduzem essas portas para Drizzle/Postgres.
- Não conhecem Fastify e não retornam respostas HTTP.
- Devem preservar operações atômicas e paginação por cursor quando exigidas pelo domínio.

### Contratos (`server/src/contracts`)

- São a fonte de verdade para validação Zod da API.
- Tipos públicos devem ser derivados com `z.infer`; não duplicar interfaces equivalentes.

## Testes

- Use cases devem possuir testes unitários sem Fastify ou banco real.
- Handlers e routes devem usar `Fastify.inject` para validar o contrato HTTP.
- Implementações de repository devem ter testes de integração com o PostgreSQL efêmero.
- Testes RED permanecem falhando até a implementação da funcionalidade correspondente.
