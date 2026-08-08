import {
  type CreateLinkBody,
  createLinkBodySchema,
  exportLinksResponseSchema,
  incrementLinkAccessResponseSchema,
  type Link,
  linkSchema,
  listLinksResponseSchema,
} from '@brev-ly/server/contracts'

import { ApiRequestError, remove, request } from '../client'

export { ApiRequestError }

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

export function deleteLink(shortCode: string): Promise<void> {
  return remove(`/links/${encodeURIComponent(shortCode)}`)
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
