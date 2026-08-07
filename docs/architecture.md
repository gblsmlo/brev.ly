# Arquitetura inicial

```text
Navegador
   │
   ▼
React SPA (web)
   │ HTTP/JSON
   ▼
Fastify API (server) ───────────► Cloudflare R2 ─► CDN pública
   │                                  CSV
   ▼
PostgreSQL
```

## Limites

- `web` contém somente interface, estado remoto e navegação da SPA.
- `server` contém validação, regras, persistência, exportação e integração com armazenamento.
- O PostgreSQL é a fonte de verdade dos links e contadores.
- O R2 armazena somente relatórios gerados; a API devolve sua URL pública.

## Modelo inicial

Tabela `links` planejada:

| Campo | Tipo | Regra |
| --- | --- | --- |
| `id` | UUID | Chave primária interna |
| `original_url` | text | URL HTTP(S) válida |
| `short_code` | varchar(30) | Único e indexado |
| `access_count` | integer | Não negativo; padrão zero |
| `created_at` | timestamptz | Preenchido pelo banco |

Além do índice único em `short_code`, a listagem terá índice em `(created_at DESC, id DESC)`
para suportar paginação por cursor.

## Qualidade

- Regras e rotas devem começar por testes de falha e sucesso.
- O incremento deve ser uma operação SQL atômica.
- Erros de domínio devem ser traduzidos para respostas HTTP consistentes.
- A aceitação final inclui build, migrations em PostgreSQL real, testes da API e jornada no
  navegador em larguras mobile e desktop.

