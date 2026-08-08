# ADR 003 — Result Pattern nos casos de uso

## Contexto

Os casos de uso comunicavam falhas previstas, como link inexistente ou código duplicado,
lançando exceções. Isso misturava controle de fluxo de negócio com falhas inesperadas de
infraestrutura e obrigava os handlers a usar blocos `try/catch` para respostas comuns.

## Decisão

Casos de uso retornam `Result<T, E>`, uma união discriminada pela propriedade `success`:

```ts
type Result<T, E> =
  | { success: true; value: T }
  | { success: false; error: E }
```

- Resultados válidos usam `success(value)`.
- Falhas previstas usam `failure(error)`.
- Handlers traduzem `failure` para o status e o contrato HTTP correspondentes.
- Exceções inesperadas continuam sendo lançadas e chegam ao error boundary do Fastify.
- Repositories ainda podem lançar erros próprios de persistência; o caso de uso traduz apenas
  aqueles que representam uma falha conhecida da aplicação.

## Consequências

- O tipo de retorno torna explícitas as falhas que cada caso de uso pode produzir.
- Handlers deixam de usar exceções como fluxo normal.
- Chamadores precisam discriminar `result.success` antes de acessar `value` ou `error`.
- Novos casos de uso devem declarar seus erros previstos no segundo parâmetro de `Result`.
