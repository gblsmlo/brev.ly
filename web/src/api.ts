import {
  type CreateLinkBody,
  createLinkBodySchema,
  exportLinksResponseSchema,
  incrementLinkAccessResponseSchema,
  type Link,
  linkSchema,
  listLinksResponseSchema,
} from '@brev-ly/server/contracts'

import { webEnv } from './env'

const baseUrl = webEnv.VITE_BACKEND_URL.replace(/\/$/, '')
export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code?: string,
  ) {
    super('API request failed')
  }
}

async function request<T>(
  path: string,
  init: RequestInit,
  parse: (value: unknown) => T,
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...init.headers },
  })
  if (!response.ok) {
    let code: string | undefined
    try {
      code = ((await response.json()) as { code?: string }).code
    } catch {}
    throw new ApiRequestError(response.status, code)
  }
  return parse(await response.json())
}

export function listLinks(): Promise<Link[]> {
  return request('/links', { method: 'GET' }, (value) => listLinksResponseSchema.parse(value).items)
}
export function createLink(input: CreateLinkBody): Promise<Link> {
  return request(
    '/links',
    { method: 'POST', body: JSON.stringify(createLinkBodySchema.parse(input)) },
    (value) => linkSchema.parse(value),
  )
}
export function getLink(shortCode: string): Promise<Link> {
  return request(`/links/${encodeURIComponent(shortCode)}`, { method: 'GET' }, (value) =>
    linkSchema.parse(value),
  )
}
export async function deleteLink(shortCode: string): Promise<void> {
  const response = await fetch(`${baseUrl}/links/${encodeURIComponent(shortCode)}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new ApiRequestError(response.status)
}
export function incrementLinkAccess(shortCode: string) {
  return request(`/links/${encodeURIComponent(shortCode)}/accesses`, { method: 'PATCH' }, (value) =>
    incrementLinkAccessResponseSchema.parse(value),
  )
}
export function exportLinks(): Promise<string> {
  return request(
    '/links/export',
    { method: 'POST' },
    (value) => exportLinksResponseSchema.parse(value).reportUrl,
  )
}
