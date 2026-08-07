# Progresso do Brev.ly

## Estado atual

**Fase 1 — Concluída**

## Fases

| Fase | Estado |
| --- | --- |
| 1. Fundação e contratos | Concluída |
| 2. Persistência e API | Não iniciada |
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

### Validação adiada

- O build da imagem não pôde ser executado porque o daemon Docker/OrbStack estava desligado.
  A validação executável permanece no checklist de aceitação da Fase 5.

## Registro de sessões

### 2026-08-07

- Criada a fundação específica do desafio a partir de um workspace vazio.
- Lint, tipos, testes e builds locais concluídos com sucesso.
- Próxima ação: iniciar a tabela `links` e os casos de uso da Fase 2, começando pelos testes.
