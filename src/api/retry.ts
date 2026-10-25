import { isApiError } from './errors'

/**
 * Retry policy for READS. Mutations are not retried automatically (they are
 * not idempotent); the UI offers an explicit retry instead.
 *
 *   attempts   up to MAX_RETRIES retries after the first failure
 *   when       only if the error says it is retryable
 *   delay      the server's Retry-After if given, else exponential backoff
 *              with full jitter: random(0, min(cap, base · 2^attempt))
 *
 * Full jitter (rather than a fixed curve) spreads retries from many clients
 * so a recovering server is not hit by a synchronized wave.
 */

export const MAX_RETRIES = 3
export const BASE_DELAY_MS = 500
export const MAX_DELAY_MS = 8_000

export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false
  return isApiError(error) ? error.retryable : false
}

export function retryDelay(failureCount: number, error: unknown, random = Math.random): number {
  if (isApiError(error) && error.retryAfterMs !== undefined) {
    return Math.min(error.retryAfterMs, MAX_DELAY_MS)
  }
  const ceiling = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** failureCount)
  return Math.floor(random() * ceiling)
}
