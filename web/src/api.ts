import {
  type CreateLinkBody,
  createLinkBodySchema,
  exportLinksResponseSchema,
  incrementLinkAccessResponseSchema,
  type Link,
  listLinksResponseSchema,
} from '@brev-ly/server/contracts'
import { z } from 'zod'

import { webEnv } from './env'

const backendUrl = webEnv.VITE_BACKEND_URL.replace(/\/$/, '')

const clientLinkSchema = z.object({
  accessCount: z.number().int().nonnegative().optional(),
  createdAt: z.iso.datetime().optional(),
  id: z.uuid().optional(),
  originalUrl: z.url(),
  shortCode: z.string().min(1),
  shortUrl: z.url().optional(),
})

function normalizeLink(value: unknown): Link {
  const link = clientLinkSchema.parse(value)
  const frontendUrl = webEnv.VITE_FRONTEND_URL.endsWith('/')
    ? webEnv.VITE_FRONTEND_URL
    : `${webEnv.VITE_FRONTEND_URL}/`

  return {
    accessCount: link.accessCount ?? 0,
    createdAt: link.createdAt ?? new Date().toISOString(),
    id: link.id ?? `client-${link.shortCode}`,
    originalUrl: link.originalUrl,
    shortCode: link.shortCode,
    shortUrl: link.shortUrl ?? new URL(link.shortCode, frontendUrl).toString(),
  }
}

export class ApiRequestError extends Error {
  readonly code: string | undefined
  readonly status: number

  constructor(status: number, code?: string) {
    super('A API não conseguiu concluir a operação.')
    this.name = 'ApiRequestError'
    this.code = code
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit, parse: (value: unknown) => T) {
  const response = await fetch(`${backendUrl}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...init.headers },
  })

  if (!response.ok) {
    let code: string | undefined

    try {
      code = ((await response.json()) as { code?: string }).code
    } catch {
      // A resposta sem JSON ainda é representada pelo status HTTP.
    }

    throw new ApiRequestError(response.status, code)
  }

  return parse(await response.json())
}

export async function listLinks(): Promise<Link[]> {
  const response = await request('/links', { method: 'GET' }, (value) => {
    const envelope = listLinksResponseSchema
      .partial()
      .extend({ items: z.array(z.unknown()) })
      .parse(value)

    return envelope.items.map(normalizeLink)
  })

  return response
}

export async function createLink(input: CreateLinkBody): Promise<Link> {
  return request(
    '/links',
    { body: JSON.stringify(createLinkBodySchema.parse(input)), method: 'POST' },
    normalizeLink,
  )
}

export async function getLink(shortCode: string): Promise<Link> {
  return request(`/links/${encodeURIComponent(shortCode)}`, { method: 'GET' }, normalizeLink)
}

export async function deleteLink(shortCode: string): Promise<void> {
  const response = await fetch(`${backendUrl}/links/${encodeURIComponent(shortCode)}`, {
    method: 'DELETE',
  })

  if (!response.ok) throw new ApiRequestError(response.status)
}

export async function incrementLinkAccess(shortCode: string) {
  return request(`/links/${encodeURIComponent(shortCode)}/accesses`, { method: 'PATCH' }, (value) =>
    incrementLinkAccessResponseSchema.parse(value),
  )
}

export async function exportLinks(): Promise<string> {
  const response = await request('/links/export', { method: 'POST' }, (value) =>
    exportLinksResponseSchema.parse(value),
  )

  return response.reportUrl
}
