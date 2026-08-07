# ADR 002 — Usar handlers na camada HTTP

- Estado: aceito
- Data: 2026-08-07

## Contexto

O projeto precisa nomear a camada que transforma requests Fastify em chamadas da aplicação. O
termo `controller` seria válido, mas não descreve tão diretamente o modelo de execução do Fastify.

## Decisão

Usar o nome `handler` para o adaptador HTTP. O fluxo padrão será:

```text
route -> handler -> use-case -> repository
```

O handler valida entradas com Zod, chama um use case e converte resultados ou erros conhecidos em
respostas HTTP. Regras de negócio permanecem nos use cases; Drizzle e Postgres permanecem nas
implementações de repository.

## Consequências

- Handlers podem ser testados com `Fastify.inject` e use cases falsos.
- Use cases podem ser testados sem Fastify e sem banco.
- Trocar o transporte HTTP não exige reescrever regras de negócio.
- Adicionar abstrações genéricas acima de `handler` não é necessário enquanto houver apenas
  Fastify como transporte.
