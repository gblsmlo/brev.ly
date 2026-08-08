# Requisitos e rastreabilidade

Este documento é a fonte de verdade do escopo obrigatório. Um item só pode mudar para
**Concluído** quando houver implementação e evidência verificável.

## Back-end

| ID | Requisito | Estado | Evidência esperada |
| --- | --- | --- | --- |
| BE-01 | Criar um link | Concluído | Testes da rota e caso de uso |
| BE-02 | Rejeitar encurtamento mal formatado | Concluído | Teste de validação 400 |
| BE-03 | Rejeitar encurtamento já existente | Concluído | Restrição única e teste 409 |
| BE-04 | Deletar por `shortCode` | Concluído | Testes 204 e 404 |
| BE-05 | Obter URL original por `shortCode` | Concluído | Testes 200 e 404 |
| BE-06 | Listar links de forma performática | Em andamento | Cursor e índice concluídos; `EXPLAIN ANALYZE` pendente |
| BE-07 | Incrementar acessos por `shortCode` | Concluído | Atualização atômica e teste concorrente |
| BE-08 | Exportar links em CSV | Concluído | Testes de conteúdo, escaping e rota HTTP |
| BE-09 | Disponibilizar CSV via CDN | Em andamento | Adapter e URL cobertos; acesso R2 real pendente |
| BE-10 | Gerar nome aleatório e único | Concluído | UUID no nome do objeto e teste de unicidade |
| BE-11 | Habilitar CORS | Concluído | Registro de `@fastify/cors` e teste/build |
| BE-12 | Usar TypeScript, Fastify, Drizzle e PostgreSQL | Em andamento | Dependências e implementação final |
| BE-13 | Disponibilizar script `db:migrate` | Concluído | `server/package.json` e comando raiz |
| BE-14 | Fornecer `.env.example` completo | Concluído | `server/.env.example` |
| BE-15 | Fornecer Dockerfile da aplicação | Concluído | `server/Dockerfile` multi-stage |

## Front-end

| ID | Requisito | Estado | Evidência esperada |
| --- | --- | --- | --- |
| FE-01 | SPA React, TypeScript e Vite sem framework | Concluído | Build apenas cliente |
| FE-02 | Página `/` com formulário e listagem | Concluído | FE-T01, FE-T02 e FE-T06 |
| FE-03 | Página `/:shortCode` com redirecionamento | Concluído | FE-T07 |
| FE-04 | Página de recurso não encontrado | Concluído | FE-T08 e FE-T09 |
| FE-05 | Validar formato e conflitos no formulário | Concluído | FE-T03 e FE-T04 |
| FE-06 | Excluir link | Concluído | FE-T05 |
| FE-07 | Incrementar acesso e redirecionar | Concluído | FE-T07 |
| FE-08 | Baixar CSV | Concluído | FE-T10 |
| FE-09 | Loading, bloqueio de ações e empty state | Concluído | FE-T01, FE-T11 e FE-T12 |
| FE-10 | Layout fiel ao Figma e responsivo | Em andamento | FE-T13 e FE-T14; revisão visual do Figma pendente |
| FE-11 | Fornecer `.env.example` completo | Concluído | `web/.env.example` |

## Entrega

| ID | Requisito | Estado | Evidência esperada |
| --- | --- | --- | --- |
| DL-01 | Repositório público no GitHub | Não iniciado | URL pública |
| DL-02 | Pastas raiz `web` e `server` | Concluído | Árvore do repositório |
| DL-03 | Código obrigatório preservado na branch principal | Em andamento | Histórico e revisão final |
| DL-04 | Front-end, back-end e DevOps documentados | Em andamento | README e documentação final |
