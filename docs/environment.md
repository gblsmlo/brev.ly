# Schemas de ambiente

Cada runtime possui um schema Zod próprio e uma função `create*Env`. Os tipos públicos são
derivados dos schemas com `z.infer`; não há interfaces manuais paralelas.

| Runtime | Schema | Facade de runtime | Tipo |
| --- | --- | --- | --- |
| API | `server/src/env-schema.ts` | `server/src/env.ts` | `ServerEnv` |
| SPA | `web/src/env-schema.ts` | `web/src/env.ts` | `WebEnv` |
| Testes | `test/env-schema.ts` | `test/setup.ts` | `TestEnv` |

## Server

`createServerEnv` seleciona apenas as chaves esperadas de `process.env` e valida tipos,
intervalo da porta, origem CORS e URL PostgreSQL. Valores Cloudflare podem ficar vazios em
desenvolvimento e testes, mas todos são obrigatórios quando `NODE_ENV=production`.

## Web

`createWebEnv` seleciona `VITE_FRONTEND_URL` e `VITE_BACKEND_URL` de `import.meta.env` e valida
ambas como URLs. Os defaults locais permitem o bootstrap inicial; valores informados continuam
sujeitos à validação.

## Testes

`createTestEnv` fornece defaults determinísticos para unitários e integração. O preload global
normaliza esses valores em `process.env` antes dos arquivos de teste serem carregados.

Segredos e configurações locais ficam em `.env.test`, ignorado pelo Git; somente
`.env.test.example` é versionado.
