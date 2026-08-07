# Contrato inicial da API

Base URL local: `http://localhost:3333`.

Os schemas Zod em `server/src/contracts` são a fonte de verdade executável deste contrato. Os
tipos TypeScript são derivados com `z.infer`; não devem ser mantidas interfaces manuais
paralelas aos schemas.

```ts
export const createLinkBodySchema = z.object({
  originalUrl: httpUrlSchema,
  shortCode: shortCodeSchema,
})

export type CreateLinkBody = z.infer<typeof createLinkBodySchema>
```

## Formato do encurtamento

`shortCode` deve corresponder a `^[A-Za-z0-9_-]{3,30}$`. A URL original deve usar `http` ou
`https`. A unicidade do código será garantida no PostgreSQL e traduzida para HTTP `409`.

## Endpoints planejados

### `POST /links`

Entrada:

```json
{
  "originalUrl": "https://example.com/article",
  "shortCode": "article"
}
```

Retorna `201` com o link criado. Erros: `400` para entrada inválida e `409` para código já
existente.

### `GET /links?cursor=<cursor>&limit=20`

Retorna uma página ordenada por `createdAt DESC, id DESC`, com `nextCursor`. `limit` terá teto
para impedir consultas sem limite.

### `GET /links/:shortCode`

Retorna a URL original e os metadados públicos. Não incrementa implicitamente o contador.

### `PATCH /links/:shortCode/accesses`

Incrementa o contador de forma atômica e retorna a URL original necessária ao
redirecionamento. Erros: `400` para código inválido e `404` para código inexistente.

### `DELETE /links/:shortCode`

Exclui o link e retorna `204`. Código inexistente retorna `404`.

### `POST /links/export`

Gera o CSV, envia para o armazenamento compatível com S3 e retorna `201`:

```json
{
  "reportUrl": "https://cdn.example.com/reports/<uuid>.csv"
}
```

O CSV conterá `original_url`, `short_url`, `access_count` e `created_at`.

## Formato de erro

```json
{
  "code": "SHORT_CODE_ALREADY_EXISTS",
  "message": "Já existe um link com esse encurtamento."
}
```

Os códigos públicos aceitos são `VALIDATION_ERROR`, `SHORT_CODE_ALREADY_EXISTS`,
`LINK_NOT_FOUND`, `EXPORT_FAILED` e `INTERNAL_ERROR`. Detalhes internos não fazem parte da
resposta pública.
