# Progresso do Brev.ly

## Estado atual

**Fase 2 — Em andamento**

## Fases

| Fase | Estado |
| --- | --- |
| 1. Fundação e contratos | Concluída |
| 2. Persistência e API | Em andamento |
| 3. Interface SPA | Não iniciada |
| 4. CSV e CDN | Não iniciada |
| 5. Aceitação e entrega | Não iniciada |

## Fase 1

### Concluído

- Git inicializado na branch `main`.
- Estrutura raiz `web` e `server` criada.
- Contratos e plano inicial documentados.
- Escolha de identificador registrada no ADR 001.
- Dependências instaladas com lockfile reproduzível.
- Lint, typecheck, 2 testes e builds de produção aprovados.
- Dockerfile multi-stage revisado e preparado para o build de aceitação.
- Primeiro commit preparado com a fundação completa.

### Decisões

- Manter a entrega obrigatória como SPA Vite, sem SSR.
- Usar `shortCode` nas operações públicas.
- Usar paginação por cursor para a listagem.
- Manter funcionalidades extras fora da branch principal até a correção.

### Validação Docker concluída

- Imagem `brevly-server:contracts` construída com o Dockerfile multi-stage.
- Contêiner executado como usuário não privilegiado e `/health` respondeu `{"status":"ok"}`.
- Corrigida a ordem de `--cwd` nos scripts Bun após o primeiro build Docker revelar que o
  artefato `dist` não estava sendo gerado.

## Registro de sessões

### 2026-08-07 — Contratos da API

- Criados schemas Zod para links, criação, parâmetros, paginação, incremento, exportação e
  erros.
- Tipos públicos derivados dos schemas com `z.infer`, sem duplicação manual.
- Contratos fechados para rejeitar campos desconhecidos.
- Adicionados 13 testes de contrato para formatos válidos, erros e limites.
- Dockerfile construído e imagem validada por uma requisição real ao endpoint `/health`.
- Próxima ação: modelar a tabela `links` e integrar os schemas às rotas Fastify.

### 2026-08-07

- Criada a fundação específica do desafio a partir de um workspace vazio.
- Lint, tipos, testes e builds locais concluídos com sucesso.
- Próxima ação: iniciar a tabela `links` e os casos de uso da Fase 2, começando pelos testes.
