# Plano de testes do desafio

## Objetivo

Validar cada requisito obrigatório do encurtador com evidência reproduzível. Este documento é
um plano de execução. Nesta etapa, os casos de domínio foram implementados como especificações
**RED**: falhas são esperadas enquanto a implementação ainda não existe.

## Níveis de teste

| Nível | Ferramenta/abordagem | Responsabilidade |
| --- | --- | --- |
| Contrato | Zod + Bun Test | Formatos, limites e erros de entrada/saída |
| Unidade | Bun Test | Casos de uso, repository e serialização CSV |
| API | Fastify `inject` + Bun Test | Status HTTP, payloads, CORS e integração dos módulos |
| Integração | PostgreSQL no `compose.test.yml` | Constraints, migrations, índices e concorrência |
| Navegador | Playwright | Jornadas da SPA, redirecionamento e download |
| Performance | PostgreSQL `EXPLAIN ANALYZE` | Paginação e ausência de scan/offset regressivo |

## Dados de teste

```text
originalUrl: https://example.com/articles/contract-first
shortCode: contract-first
invalidShortCode: has spaces
duplicateShortCode: contract-first
```

Cada teste de integração deve criar seus próprios registros e limpar o estado. O banco efêmero
usa PostgreSQL em `127.0.0.1:5433`; não usar o banco de desenvolvimento.

## Back-end

| ID | Caso | Tipo | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| BE-T01 | Criar link com URL e código válidos | API | `201` e representação completa | Planejado |
| BE-T02 | Rejeitar código com espaços, barras, caracteres fora do padrão, vazio, curto ou longo | Contrato/API | `400` com `VALIDATION_ERROR`; nenhum registro criado | Planejado |
| BE-T03 | Rejeitar URL original que não seja HTTP(S) | Contrato/API | `400` com `VALIDATION_ERROR` | Planejado |
| BE-T04 | Criar dois links com o mesmo `shortCode` | Integração/API | `409` com `SHORT_CODE_ALREADY_EXISTS`; constraint única preservada | Planejado |
| BE-T05 | Excluir link existente por `shortCode` | API/Integração | `204`; nova consulta retorna `404` | Planejado |
| BE-T06 | Excluir código inexistente ou mal formatado | API | `404` ou `400`, respectivamente | Planejado |
| BE-T07 | Resolver `shortCode` existente | API | `200` com URL original e metadados | Planejado |
| BE-T08 | Resolver código inexistente | API | `404` com `LINK_NOT_FOUND` | Planejado |
| BE-T09 | Listar coleção vazia | API | `200`, `items: []` e cursor nulo | Planejado |
| BE-T10 | Listar coleção com cursor e limite | API/Integração | Ordem estável, limite respeitado e `nextCursor` correto | Planejado |
| BE-T11 | Rejeitar limite zero, negativo, decimal ou acima do teto | Contrato/API | `400` sem consulta ilimitada | Planejado |
| BE-T12 | Incrementar acessos de um link | API/Integração | Operação atômica e contador incrementado em `1` | Planejado |
| BE-T13 | Incrementar acessos concorrentemente | Integração | N requisições resultam em exatamente N incrementos | Planejado |
| BE-T14 | Incrementar código inexistente | API | `404` com `LINK_NOT_FOUND` | Planejado |
| BE-T15 | Exportar coleção em CSV | Unidade/API | `201`, content-type/colunas corretos e dados completos | Planejado |
| BE-T16 | Exportar coleção vazia | Unidade/API | CSV válido com cabeçalho e zero linhas de dados | Planejado |
| BE-T17 | Gerar dois relatórios | Unidade/Integração | Nomes diferentes, aleatórios e sem colisão | Planejado |
| BE-T18 | Publicar relatório no armazenamento CDN | Integração | URL pública retornada e objeto acessível | Planejado |
| BE-T19 | Falha do armazenamento durante exportação | Unidade/API | Erro controlado `EXPORT_FAILED`; sem URL falsa | Planejado |
| BE-T20 | Confirmar colunas do CSV | Unidade | `original_url`, `short_url`, `access_count`, `created_at` | Planejado |
| BE-T21 | Verificar paginação em tabela grande | Performance | Plano usa índice `(created_at, id)` e não depende de `OFFSET` | Planejado |
| BE-T22 | Validar CORS preflight | API | Origem configurada recebe headers CORS; origem indevida é rejeitada | Planejado |

## Front-end

| ID | Caso | Tipo | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| FE-T01 | Abrir `/` sem links | Navegador | Formulário visível e empty state apresentado | Planejado |
| FE-T02 | Criar link válido pelo formulário | Navegador/API | Link aparece na listagem após sucesso | Planejado |
| FE-T03 | Enviar código mal formatado | Componente/Navegador | Validação visível; requisição não é enviada | Planejado |
| FE-T04 | Enviar código duplicado | Navegador/API | Erro `409` apresentado sem apagar dados existentes | Planejado |
| FE-T05 | Excluir link | Navegador/API | Ação bloqueia durante request e item desaparece após `204` | Planejado |
| FE-T06 | Listar links cadastrados | Navegador/API | Todas as colunas necessárias são exibidas | Planejado |
| FE-T07 | Acessar `/:shortCode` existente | Navegador/API | Busca, incrementa e redireciona para URL original | Planejado |
| FE-T08 | Acessar `/:shortCode` inexistente | Navegador/API | Página de recurso não encontrado | Planejado |
| FE-T09 | Digitar rota fora do padrão | Navegador | Página de recurso não encontrado | Planejado |
| FE-T10 | Baixar relatório CSV | Navegador/API | Download iniciado usando URL CDN retornada | Planejado |
| FE-T11 | Falha de API durante criação/listagem/exclusão | Navegador | Mensagem de erro, sem estado falso ou ação duplicada | Planejado |
| FE-T12 | Loading e bloqueio de ações | Componente/Navegador | Botões e formulário refletem estado assíncrono | Planejado |
| FE-T13 | Layout em viewport mobile | Navegador | Conteúdo utilizável sem overflow horizontal | Planejado |
| FE-T14 | Layout em viewport desktop | Navegador | Formulário, listagem e ações permanecem legíveis | Planejado |

## Portões de aceite

1. Os contratos Zod e testes unitários passam.
2. Migrations são aplicadas no PostgreSQL efêmero.
3. Todos os casos BE-T01–BE-T22 passam, exceto cenários explicitamente não aplicáveis.
4. Todos os casos FE-T01–FE-T14 passam em desktop e mobile.
5. `bun run lint`, `bun run typecheck`, `bun run test`, build e testes de integração passam.
6. Cada item da matriz em [requirements.md](requirements.md) aponta para um teste ou evidência.

## Execução RED — 2026-08-07

As células da matriz continuam como **Planejado** até a etapa GREEN; a existência da
especificação RED não significa que a funcionalidade foi aceita.

- Back-end: 37 testes executados; 36 falharam e 1 passou (preflight CORS). As falhas confirmam
  as lacunas esperadas em rotas, schema Drizzle, repository e exportador CSV/CDN.
- Front-end: 14 especificações Playwright implementadas e descobertas pelo runner (`--list`). A
  execução no navegador fica pendente da implementação da SPA e da instalação do browser Chromium.
- `bun run lint` e `bun run typecheck` passam. Nenhum caso RED deve ser interpretado como requisito
  concluído.
