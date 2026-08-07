# ADR 001: usar `shortCode` nas operações públicas

- **Estado:** Aceita
- **Data:** 2026-08-07

## Contexto

O desafio permite escolher entre o identificador interno e o encurtamento para deletar e
incrementar acessos, mas exige consistência entre as operações.

## Decisão

As operações públicas de resolução, incremento e exclusão usarão `shortCode`. O UUID interno
continua existindo para identidade e paginação no banco, mas não será necessário nas ações da
interface.

## Consequências

- A SPA utiliza o mesmo identificador exibido ao usuário.
- A API precisa validar o formato antes de consultar o banco.
- A restrição única no banco torna cada rota não ambígua.
- Uma futura alteração do código curto exigiria tratar estabilidade de URLs; essa alteração não
  faz parte do desafio.

