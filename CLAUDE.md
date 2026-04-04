# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev              # Start dev server with hot reload (tsx watch)
pnpm build            # Compile TypeScript with tsup
pnpm start            # Run compiled server

# Testing
pnpm vitest           # Run all tests
pnpm vitest run <file># Run a single test file

# Database
pnpm db:generate      # Generate Drizzle migrations from schema changes
pnpm db:migrate       # Apply pending migrations
pnpm db:studio        # Open Drizzle Studio UI

# Code quality
pnpm lint             # Run Biome linter
pnpm lint:fix         # Auto-fix lint issues
pnpm lint:check       # Check formatting and linting

# Commits (use this instead of git commit directly)
pnpm commit           # Interactive conventional commit prompt (czg)
```

## Architecture

Data flow follows a strict layered pipeline — never skip layers:

```
Route → Use Case → Repository → Database
```

```
src/
├── app/
│   └── {entity}/                    # one directory per bounded context
│       ├── {entity}.types.ts        # User, UserInsert, UserUpdate — inferred from Drizzle schema
│       ├── {entity}.repository.ts   # interface only (domain contract)
│       └── use-cases/               # one file per use case
├── infra/
│   ├── env.ts                       # Zod-validated env — never use process.env directly
│   ├── db/
│   │   ├── index.ts                 # Drizzle client (snake_case, logger in dev)
│   │   ├── schemas/                 # pgTable definitions — source of truth for entity types
│   │   ├── repositories/            # Drizzle implementations of app interfaces
│   │   └── migrations/
│   └── http/
│       ├── app.ts                   # buildApp() factory
│       ├── server.ts                # listen entrypoint
│       └── routes/                  # Fastify route plugins — HTTP contract only
```

**Dependency direction** — `infra` always depends on `app`, never the reverse:
```
infra/http/routes → app/{entity}/use-cases → app/{entity}/repository (interface)
                                                      ↑
                                   infra/db/repositories implements this
```

### Layer responsibilities

**Route** (`FastifyPluginAsyncZod`) — declares method, path, Zod body/response schema. Catches typed domain errors and maps to HTTP status codes. Zero business logic.

**Use Case** — curried function: `(repo: IRepo) => async (payload) => result`. Contains all business logic. Throws typed domain error classes (declared in the same file). No framework dependencies.

**Repository** — TypeScript interface first, then a class implementing it with Drizzle. The route instantiates the implementation and injects it into the use case. Never call ORM outside repositories.

**Schema (Zod)** — declared inside the route file, used by Fastify type provider for static inference and runtime validation.

### Key conventions

**Use case shape:**
```ts
export class EntityNotFoundError extends Error {
  constructor() { super('Entity not found') }
}

export const myUseCase = (repo: IEntityRepo) => async (payload: Payload) => {
  // business logic, throw EntityNotFoundError when needed
}
```

**Entity types — always infer from Drizzle schema, never declare manually:**
```ts
type Entity    = typeof entityTable.$inferSelect
type NewEntity = typeof entityTable.$inferInsert
type UpdateEntity = Partial<Pick<NewEntity, 'field1' | 'field2'>>
```

**Repository contract:**
```ts
interface IEntityRepo {
  create(data: NewEntity): Promise<Entity>
  findById(id: string): Promise<Entity | undefined>
  findAll(): Promise<Entity[]>
  update(id: string, data: UpdateEntity): Promise<Entity | undefined>
  delete(id: string): Promise<void>
}
```

**Route error handling:**
```ts
try {
  const result = await myUseCase(repo)(req.body)
  return reply.status(201).send(result)
} catch (err) {
  if (err instanceof EntityNotFoundError) return reply.status(404).send({ message: err.message })
  if (err instanceof DuplicateEntityError) return reply.status(409).send({ message: err.message })
  throw err // let Fastify handle unexpected errors
}
```

**App factory** — `buildApp()` returns the Fastify instance without calling `listen`. Production entrypoint calls `buildApp().then(app => app.listen(...))`. Tests use `buildApp()` + `app.inject()` directly.

**Path aliases** — `@/*` → `src/*`, `@infra/*` → `src/infra/*`, `@shared/*` → `src/shared/*`.

## Testing

Framework: **Vitest** with **no mocks** — tests run against a real database in an isolated test environment.

- `beforeAll`: apply migrations programmatically via `migrate(db, { migrationsFolder })`
- `beforeEach`: truncate tables with `db.delete(table)`
- HTTP assertions via `app.inject()` (no supertest or external HTTP client)

**Minimum coverage per resource:**
- Create: 201 success, 409 duplicate, 400 invalid payload
- List: empty, with data
- Get by ID: 200 found, 404 not found, 400 invalid UUID
- Update: 200 success, 404 not found, 400 empty body
- Delete: 204 success, 404 not found + confirm via subsequent GET

## Anti-Patterns

- Business logic inside route handlers
- Calling ORM (Drizzle) outside repository implementations
- Manually declared entity interfaces (use `$inferSelect` / `$inferInsert`)
- Stateful use case classes
- Mocking the database in tests
- `process.env` anywhere — use `src/infra/env.ts`

## Commit Convention

Commits are validated by commitlint. Use `pnpm commit` for the interactive prompt. Format: `type: description` (emoji prefix added automatically). Valid types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `ci`, `perf`, `build`, `revert`.

## Local Setup

```bash
docker compose up -d  # Start PostgreSQL on localhost:5432
```

`.env` values:
```
DATABASE_URL="postgresql://docker:docker@localhost:5432/tc96"
NODE_ENV="dev"
```
