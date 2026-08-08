# Infraestrutura local

Esta pasta contém apenas a infraestrutura necessária para desenvolvimento local. Ela faz parte
do monorepo e não substitui as pastas obrigatórias `web/` e `server/`.

## PostgreSQL de desenvolvimento

Subir o banco:

```bash
bun run infra:dev
```

O serviço fica disponível em `127.0.0.1:5432`, com:

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/brevly
```

Parar o serviço mantendo os dados:

```bash
bun run infra:down
```

Ver logs:

```bash
bun run infra:logs
```

Depois de subir o banco e configurar `server/.env`, execute `bun run db:migrate` e, em outro
terminal, `bun run dev`.

O Compose de testes continua separado em `compose.test.yml`, usa a porta `5433` e um volume
efêmero para não misturar dados de desenvolvimento com os testes.
