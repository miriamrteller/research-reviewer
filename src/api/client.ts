import { ApiError, parseRetryAfter } from './errors'

/**
 * The one place the app talks HTTP.
 *
 * Schema-agnostic by design: callers pass a `parse` function (a Zod schema's
 * `.parse`, a generated OpenAPI validator — anything `(unknown) => T`) and get
 * a typed `T` back. Every failure becomes an `ApiError` with a `retryable`
 * verdict, so the retry policy upstream never inspects raw responses.
 */

export interface RequestOptions<T> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Validates and types the decoded JSON body. Throw to reject the payload. */
  parse: (data: unknown) => T
  signal?: AbortSignal
  /** Per-request deadline. Defaults to 10 s. */
  timeoutMs?: number
  headers?: Record<string, string>
}

export const DEFAULT_TIMEOUT_MS = 10_000

export async function request<T>(path: string, options: RequestOptions<T>): Promise<T> {
  const { method = 'GET', body, parse, signal, timeoutMs = DEFAULT_TIMEOUT_MS, headers } = options

  const timeout = AbortSignal.timeout(timeoutMs)
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout

  let response: Response
  try {
    response = await fetch(path, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: combined,
    })
  } catch (cause) {
    if (timeout.aborted) {
      throw new ApiError(`Request to ${path} timed out after ${timeoutMs} ms`, {
        kind: 'timeout',
        cause,
      })
    }
    if (signal?.aborted) {
      throw new ApiError(`Request to ${path} was cancelled`, { kind: 'abort', cause })
    }
    throw new ApiError(`Network error requesting ${path}`, { kind: 'network', cause })
  }

  if (!response.ok) {
    throw new ApiError(`${method} ${path} failed with HTTP ${response.status}`, {
      kind: 'http',
      status: response.status,
      retryAfterMs: parseRetryAfter(response.headers.get('Retry-After')),
    })
  }

  // 204 and friends: nothing to decode. Let `parse` decide whether undefined is acceptable.
  const text = await response.text()
  let data: unknown = undefined
  if (text.length > 0) {
    try {
      data = JSON.parse(text)
    } catch (cause) {
      throw new ApiError(`${method} ${path} returned a non-JSON body`, {
        kind: 'validation',
        status: response.status,
        cause,
      })
    }
  }

  try {
    return parse(data)
  } catch (cause) {
    throw new ApiError(`${method} ${path} returned an unexpected shape`, {
      kind: 'validation',
      status: response.status,
      cause,
    })
  }
}
