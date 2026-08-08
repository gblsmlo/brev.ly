import { Buffer } from 'node:buffer'

import type { CreateLinkBody, Link, ListLinksQuery } from '../contracts'
import {
  DuplicateShortCodeRepositoryError,
  InvalidLinksCursorRepositoryError,
  LinkNotFoundRepositoryError,
  type LinksRepository,
} from '../repositories'

export class InMemoryLinksRepository implements LinksRepository {
  readonly items: Link[] = []
  private createdSequence = 0

  async create(input: CreateLinkBody): Promise<Link> {
    if (this.items.some((item) => item.shortCode === input.shortCode)) {
      throw new DuplicateShortCodeRepositoryError()
    }

    this.createdSequence += 1
    const link: Link = {
      ...input,
      accessCount: 0,
      createdAt: new Date(Date.UTC(2026, 7, 7, 12, 0, 0, this.createdSequence)).toISOString(),
      id: crypto.randomUUID(),
      shortUrl: `http://localhost:5173/${input.shortCode}`,
    }
    this.items.push(link)
    return link
  }

  async deleteByShortCode(shortCode: string): Promise<boolean> {
    const index = this.items.findIndex((item) => item.shortCode === shortCode)

    if (index < 0) {
      return false
    }

    this.items.splice(index, 1)
    return true
  }

  async findByShortCode(shortCode: string): Promise<Link | null> {
    return this.items.find((item) => item.shortCode === shortCode) ?? null
  }

  async incrementAccesses(shortCode: string) {
    const link = await this.findByShortCode(shortCode)

    if (!link) {
      throw new LinkNotFoundRepositoryError()
    }

    link.accessCount += 1
    return { accessCount: link.accessCount, originalUrl: link.originalUrl }
  }

  async list({ cursor, limit }: ListLinksQuery) {
    const ordered = [...this.items].sort((left, right) => {
      const dateOrder = right.createdAt.localeCompare(left.createdAt)
      return dateOrder || right.id.localeCompare(left.id)
    })
    let start = 0

    if (cursor) {
      let cursorId: string

      try {
        cursorId = Buffer.from(cursor, 'base64url').toString('utf8')
      } catch {
        throw new InvalidLinksCursorRepositoryError()
      }

      const cursorIndex = ordered.findIndex((item) => item.id === cursorId)

      if (cursorIndex < 0) {
        throw new InvalidLinksCursorRepositoryError()
      }

      start = cursorIndex + 1
    }

    const items = ordered.slice(start, start + limit)
    const hasNextPage = start + limit < ordered.length

    return {
      items,
      nextCursor: hasNextPage ? Buffer.from(items.at(-1)?.id ?? '').toString('base64url') : null,
    }
  }
}
