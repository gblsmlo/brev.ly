import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test'

import { createDatabase, type Database } from '../database/client'
import { links } from '../database/schema'

const describeIntegration = process.env.RUN_INTEGRATION_TESTS === 'true' ? describe : describe.skip

type ExplainPlan = {
  Plan: {
    'Node Type': string
    Plans?: ExplainPlan['Plan'][]
  }
}

function findPlanNode(plan: ExplainPlan['Plan'], nodeType: string): ExplainPlan['Plan'] | null {
  if (plan['Node Type'] === nodeType) return plan

  for (const child of plan.Plans ?? []) {
    const found = findPlanNode(child, nodeType)
    if (found) return found
  }

  return null
}

describeIntegration('links repository pagination performance', () => {
  let db: Database
  let closeDatabase: () => Promise<void>
  let query: (sql: string) => Promise<{ rows: Array<{ 'QUERY PLAN': ExplainPlan[] }> }>

  beforeAll(async () => {
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) throw new Error('DATABASE_URL is required for performance tests')

    const database = createDatabase(databaseUrl)
    db = database.db
    query = (sql) => database.pool.query(sql)
    closeDatabase = () => database.pool.end()
  })

  beforeEach(async () => {
    await db.delete(links)
  })

  afterAll(async () => {
    await closeDatabase()
  })

  test('BE-T21 uses the keyset index without OFFSET for a large collection', async () => {
    await query(`
      INSERT INTO links (id, original_url, short_code, access_count, created_at)
      SELECT
        md5('performance-' || series)::uuid,
        'https://example.com/performance/' || series,
        'performance-' || series,
        0,
        now() - (series * interval '1 second')
      FROM generate_series(1, 10000) AS series
    `)

    const result = await query(`
      EXPLAIN (ANALYZE, FORMAT JSON)
      SELECT id, original_url, short_code, access_count, created_at
      FROM links
      ORDER BY created_at DESC NULLS LAST, id DESC NULLS LAST
      LIMIT 20
    `)
    const plan = result.rows[0]?.['QUERY PLAN'][0]

    if (!plan) throw new Error('Expected PostgreSQL to return an execution plan')

    expect(
      findPlanNode(plan.Plan, 'Index Scan') ?? findPlanNode(plan.Plan, 'Index Only Scan'),
    ).not.toBeNull()
    expect(JSON.stringify(plan)).not.toContain('"Node Type":"Sort"')
    expect(JSON.stringify(plan)).not.toContain('Offset')
  })
})
