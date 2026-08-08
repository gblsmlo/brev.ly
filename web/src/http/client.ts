import { webEnv } from '../env'

const baseUrl = webEnv.VITE_BACKEND_URL.replace(/\/$/, '')

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code?: string,
  ) {
    super('API request failed')
  }
}

export function createRequestHeaders(init: RequestInit): Headers {
  const headers = new Headers(init.headers)

  if (init.body !== undefined && init.body !== null && !headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }

  return headers
}

export async function request<T>(
  path: string,
  init: RequestInit,
  parse: (value: unknown) => T,
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: createRequestHeaders(init),
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

export async function remove(path: string): Promise<void> {
  const response = await fetch(`${baseUrl}${path}`, { method: 'DELETE' })
  if (!response.ok) throw new ApiRequestError(response.status)
}
