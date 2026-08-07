import { describe, expect, test } from 'bun:test'

type SchemaModule = {
  links?: {
    shortCode?: { config?: { isUnique?: boolean } }
    accessCount?: { config?: { notNull?: boolean } }
  }
}

async function loadSchema() {
  const modulePath = './schema'
  return (await import(modulePath)) as SchemaModule
}

describe('Drizzle links schema RED contract', () => {
  test('BE-T04 has a unique short code column', async () => {
    const schema = await loadSchema()

    expect(schema.links).toBeDefined()
    expect(schema.links?.shortCode?.config?.isUnique).toBeTrue()
  })

  test('BE-T12 persists a non-null access counter', async () => {
    const schema = await loadSchema()

    expect(schema.links?.accessCount?.config?.notNull).toBeTrue()
  })
})
