# Task 003 — Setup do Bun Test

## Objetivo

Preparar uma execução rápida e determinística para testes unitários, contratos e futuros testes
de integração do repository.

## Critérios de aceite

- [x] `bun test` é o runner canônico da raiz.
- [x] Setup global carregado por `bunfig.toml`.
- [x] Ambiente determinístico e mocks restaurados entre testes.
- [x] Arquivos isolados para reduzir vazamento de estado.
- [x] Scripts de watch, cobertura e filtros por workspace.
- [x] PostgreSQL de testes separado, efêmero e com healthcheck.
- [x] Variáveis de teste documentadas sem versionar `.env.test`.
- [ ] Primeiro teste de integração; será criado com o schema Drizzle e o repository.

## Evidências

- `bunfig.toml`
- `test/setup.ts`
- `.env.test.example`
- `compose.test.yml`
- `docs/testing.md`
