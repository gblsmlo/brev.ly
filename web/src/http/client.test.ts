import { describe, expect, test } from 'bun:test'

import { createRequestHeaders } from './client'

describe('HTTP client headers', () => {
  test('does not declare a JSON body when the request has no body', () => {
    const headers = createRequestHeaders({ method: 'PATCH' })

    expect(headers.has('content-type')).toBeFalse()
  })

  test('declares JSON content when the request has a body', () => {
    const headers = createRequestHeaders({ body: JSON.stringify({ shortCode: 'docs' }) })

    expect(headers.get('content-type')).toBe('application/json')
  })
})
