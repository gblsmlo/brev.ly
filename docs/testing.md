# Estratégia de testes com Bun Test

O comando canônico é `bun run test`. Ele usa o test runner nativo do Bun a partir da raiz e
descobre os testes de `web`, `server` e `test`.

## Configuração global

O arquivo `bunfig.toml` carrega `test/setup.ts` antes dos testes. O setup:

- define `NODE_ENV=test`;
- fixa o fuso em UTC;
- restaura mocks e spies depois de cada teste.

Cada arquivo é executado com `--isolate` para não compartilhar o objeto global com outros
arquivos. O timeout padrão é cinco segundos.

## Convenções

| Tipo | Nome | Dependências externas |
| --- | --- | --- |
| Unitário/contrato | `*.test.ts` ou `*.test.tsx` | Não |
| Integração | `*.integration.test.ts` | PostgreSQL ou outro serviço real |
| Aceitação no navegador | Será definido na Fase 3 | API e aplicação executáveis |

Testes unitários não devem iniciar Docker, acessar a rede ou depender de ordem. Testes de
integração devem limpar os dados que criam e podem usar transações quando isso não esconder o
comportamento que está sendo verificado.

## Comandos

```bash
bun run test
bun run test:watch
bun run test:server
bun run test:web
bun run test:coverage
```

A cobertura é opt-in e gera saída no terminal e `coverage/lcov.info`. Um limite obrigatório só
será definido quando os principais casos de uso existirem, evitando uma meta artificial sobre
um scaffold.

## PostgreSQL para testes de integração

Prepare o ambiente uma vez:

```bash
cp .env.test.example .env.test
bun run test:db:up
```

Depois que a primeira migration Drizzle for gerada na Fase 2, aplique-a com
`bun run test:db:migrate` antes dos testes de repository.

Execute os testes e encerre o serviço:

```bash
bun run test:integration
bun run test:db:down
```

O `compose.test.yml` publica somente em `127.0.0.1:5433`, possui healthcheck e guarda os dados
em `tmpfs`. O banco de testes é separado do banco de desenvolvimento.

Se a porta `5433` já estiver ocupada, use o mesmo valor alternativo no Compose e na URL:

```bash
POSTGRES_TEST_PORT=5434 bun run test:db:up
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/brevly_test bun run test:db:migrate
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/brevly_test bun run test:integration
```

## Referências

- [Configuração do Bun Test](https://bun.com/docs/test/configuration)
- [Ciclo de vida e setup global](https://bun.com/docs/test/lifecycle)
- [Cobertura de código](https://bun.com/docs/test/code-coverage)
