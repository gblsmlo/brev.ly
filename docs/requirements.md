# Requisitos e rastreabilidade

Este documento é a fonte de verdade do escopo obrigatório. Um item só pode mudar para
**Concluído** quando houver implementação e evidência verificável.

## Back-end

| ID | Requisito | Estado | Evidência esperada |
| --- | --- | --- | --- |
| BE-01 | Criar um link | Não iniciado | Testes da rota e caso de uso |
| BE-02 | Rejeitar encurtamento mal formatado | Não iniciado | Teste de validação 400 |
| BE-03 | Rejeitar encurtamento já existente | Não iniciado | Restrição única e teste 409 |
| BE-04 | Deletar por `shortCode` | Não iniciado | Testes 204 e 404 |
| BE-05 | Obter URL original por `shortCode` | Não iniciado | Testes 200 e 404 |
| BE-06 | Listar links de forma performática | Não iniciado | Paginação por cursor e índice |
| BE-07 | Incrementar acessos por `shortCode` | Não iniciado | Atualização atômica e teste concorrente |
| BE-08 | Exportar links em CSV | Não iniciado | Teste de conteúdo e cabeçalhos |
| BE-09 | Disponibilizar CSV via CDN | Não iniciado | URL pública retornada pela API |
| BE-10 | Gerar nome aleatório e único | Não iniciado | UUID no nome do objeto |
| BE-11 | Habilitar CORS | Concluído | Registro de `@fastify/cors` e teste/build |
| BE-12 | Usar TypeScript, Fastify, Drizzle e PostgreSQL | Em andamento | Dependências e implementação final |
| BE-13 | Disponibilizar script `db:migrate` | Concluído | `server/package.json` e comando raiz |
| BE-14 | Fornecer `.env.example` completo | Concluído | `server/.env.example` |
| BE-15 | Fornecer Dockerfile da aplicação | Concluído | `server/Dockerfile` multi-stage |

## Front-end

| ID | Requisito | Estado | Evidência esperada |
| --- | --- | --- | --- |
| FE-01 | SPA React, TypeScript e Vite sem framework | Concluído | Build apenas cliente |
| FE-02 | Página `/` com formulário e listagem | Não iniciado | Testes de componente e navegador |
| FE-03 | Página `/:shortCode` com redirecionamento | Em andamento | Rota criada; integração pendente |
| FE-04 | Página de recurso não encontrado | Em andamento | Rota criada; layout final pendente |
| FE-05 | Validar formato e conflitos no formulário | Não iniciado | Testes de formulário e erros da API |
| FE-06 | Excluir link | Não iniciado | Teste de interação |
| FE-07 | Incrementar acesso e redirecionar | Não iniciado | Teste da jornada |
| FE-08 | Baixar CSV | Não iniciado | Teste de interação com URL da CDN |
| FE-09 | Loading, bloqueio de ações e empty state | Não iniciado | Stories/testes e navegador |
| FE-10 | Layout fiel ao Figma e responsivo | Não iniciado | Comparação visual desktop/mobile |
| FE-11 | Fornecer `.env.example` completo | Concluído | `web/.env.example` |

## Entrega

| ID | Requisito | Estado | Evidência esperada |
| --- | --- | --- | --- |
| DL-01 | Repositório público no GitHub | Não iniciado | URL pública |
| DL-02 | Pastas raiz `web` e `server` | Concluído | Árvore do repositório |
| DL-03 | Código obrigatório preservado na branch principal | Em andamento | Histórico e revisão final |
| DL-04 | Front-end, back-end e DevOps documentados | Em andamento | README e documentação final |

