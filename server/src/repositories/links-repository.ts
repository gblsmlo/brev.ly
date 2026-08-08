import { Buffer } from 'node:buffer'

import { and, desc, eq, lt, or, sql } from 'drizzle-orm'

import type { CreateLinkBody, Link } from '../contracts'
import type { Database } from '../database/client'
import { type LinkRecord, links } from '../database/schema'
import { DuplicateShortCodeRepositoryError } from './errors'
import type { LinksRepository } from './ports'

interface CreateLinksRepositoryOptions {
  db: Database
  frontendUrl: string
}

interface LinksCursor {
  createdAt: string
  id: string
}

function hasPostgresErrorCode(error: unknown, code: string): boolean {
  if (typeof error !== 'object' || !error) {
    return false
  }

  if ('code' in error && error.code === code) {
    return true
  }

  return 'cause' in error && hasPostgresErrorCode(error.cause, code)
}

function toLink(record: LinkRecord, frontendUrl: string): Link {
  const baseUrl = frontendUrl.endsWith('/') ? frontendUrl : `${frontendUrl}/`

  return {
    ...record,
    createdAt: record.createdAt.toISOString(),
    shortUrl: new URL(record.shortCode, baseUrl).toString(),
  }
}

function encodeCursor(record: LinkRecord): string {
  const cursor: LinksCursor = {
    createdAt: record.createdAt.toISOString(),
    id: record.id,
  }

  return Buffer.from(JSON.stringify(cursor)).toString('base64url')
}

function decodeCursor(cursor: string): LinksCursor {
  const value = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as LinksCursor

  if (!value.createdAt || !value.id || Number.isNaN(new Date(value.createdAt).getTime())) {
    throw new Error('Invalid links cursor')
  }

  return value
}

export function createLinksRepository({
  db,
  frontendUrl,
}: CreateLinksRepositoryOptions): LinksRepository {
  return {
    async create(input: CreateLinkBody) {
      let record: LinkRecord | undefined

      try {
        const records = await db
          .insert(links)
          .values({ originalUrl: input.originalUrl, shortCode: input.shortCode })
          .returning()
        record = records[0]
      } catch (error) {
        if (hasPostgresErrorCode(error, '23505')) {
          throw new DuplicateShortCodeRepositoryError()
        }

        throw error
      }

      if (!record) {
        throw new Error('Link insert did not return a record')
      }

      return toLink(record, frontendUrl)
    },

    async deleteByShortCode(shortCode) {
      const deleted = await db.delete(links).where(eq(links.shortCode, shortCode)).returning({
        id: links.id,
      })

      return deleted.length > 0
    },

    async findByShortCode(shortCode) {
      const record = await db.query.links.findFirst({
        where: eq(links.shortCode, shortCode),
      })

      return record ? toLink(record, frontendUrl) : null
    },

    async incrementAccesses(shortCode) {
      const [record] = await db
        .update(links)
        .set({ accessCount: sql`${links.accessCount} + 1` })
        .where(eq(links.shortCode, shortCode))
        .returning({
          accessCount: links.accessCount,
          originalUrl: links.originalUrl,
        })

      if (!record) {
        throw new Error('Link not found')
      }

      return record
    },

    async list({ cursor, limit }) {
      const decodedCursor = cursor ? decodeCursor(cursor) : null
      const cursorDate = decodedCursor ? new Date(decodedCursor.createdAt) : null
      const cursorCondition =
        decodedCursor && cursorDate
          ? or(
              lt(links.createdAt, cursorDate),
              and(eq(links.createdAt, cursorDate), lt(links.id, decodedCursor.id)),
            )
          : undefined

      const records = await db
        .select()
        .from(links)
        .where(cursorCondition)
        .orderBy(desc(links.createdAt), desc(links.id))
        .limit(limit + 1)
      const hasNextPage = records.length > limit
      const pageRecords = hasNextPage ? records.slice(0, limit) : records
      const lastRecord = pageRecords.at(-1)

      return {
        items: pageRecords.map((record) => toLink(record, frontendUrl)),
        nextCursor: hasNextPage && lastRecord ? encodeCursor(lastRecord) : null,
      }
    },
  }
}
