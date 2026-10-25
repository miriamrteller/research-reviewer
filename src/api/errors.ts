/**
 * One error type for everything that can go wrong talking to the API.
 *
 * `retryable` is the single fact the retry policy needs. It is decided here,
 * once, from the failure kind and HTTP status — never per call site:
 *   network / timeout          → retryable (transient by nature)
 *   HTTP 408, 425, 429, 5xx    → retryable (server or rate-limit trouble)
 *   other 4xx                  → not retryable (the request itself is wrong)
 *   validation                 → not retryable (the contract is broken; retrying
 *                                 the same request returns the same bad shape)
 *   abort                      → not retryable (the caller cancelled)
 */

export type ApiErrorKind = 'http' | 'network' | 'timeout' | 'validation' | 'abort'

const RETRYABLE_STATUSES = new Set([408, 425, 429])

export interface ApiErrorOptions {
  kind: ApiErrorKind
  status?: number
  /** Milliseconds the server asked us to wait (from `Retry-After`), if any. */
  retryAfterMs?: number
  cause?: unknown
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number | undefined
  readonly retryAfterMs: number | undefined
  readonly retryable: boolean

  constructor(message: string, { kind, status, retryAfterMs, cause }: ApiErrorOptions) {
    super(message, { cause })
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
    this.retryAfterMs = retryAfterMs
    this.retryable = ApiError.isRetryable(kind, status)
  }

  static isRetryable(kind: ApiErrorKind, status?: number): boolean {
    if (kind === 'network' || kind === 'timeout') return true
    if (kind === 'http' && status !== undefined) {
      return status >= 500 || RETRYABLE_STATUSES.has(status)
    }
    return false
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/** Parse an HTTP `Retry-After` header (seconds or HTTP-date) into milliseconds. */
export function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined
  const seconds = Number(header)
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)
  const date = Date.parse(header)
  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now())
}
