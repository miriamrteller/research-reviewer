// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { ApiError } from './errors'
import { BASE_DELAY_MS, MAX_DELAY_MS, MAX_RETRIES, retryDelay, shouldRetry } from './retry'

const retryable = new ApiError('503', { kind: 'http', status: 503 })
const notRetryable = new ApiError('404', { kind: 'http', status: 404 })

describe('shouldRetry', () => {
  it('retries retryable errors up to MAX_RETRIES times', () => {
    for (let n = 0; n < MAX_RETRIES; n += 1) expect(shouldRetry(n, retryable)).toBe(true)
    expect(shouldRetry(MAX_RETRIES, retryable)).toBe(false)
  })
  it('never retries non-retryable errors', () => {
    expect(shouldRetry(0, notRetryable)).toBe(false)
  })
  it('never retries unknown error types', () => {
    expect(shouldRetry(0, new Error('boom'))).toBe(false)
    expect(shouldRetry(0, 'string')).toBe(false)
  })
})

describe('retryDelay', () => {
  it('honours Retry-After when the server provides one', () => {
    const error = new ApiError('503', { kind: 'http', status: 503, retryAfterMs: 1500 })
    expect(retryDelay(0, error)).toBe(1500)
  })
  it('caps Retry-After at MAX_DELAY_MS', () => {
    const error = new ApiError('503', { kind: 'http', status: 503, retryAfterMs: 60_000 })
    expect(retryDelay(0, error)).toBe(MAX_DELAY_MS)
  })
  it('backs off exponentially with full jitter', () => {
    // random() = 1 gives the ceiling for each attempt; random() = 0 gives zero.
    expect(retryDelay(0, retryable, () => 0.999)).toBe(Math.floor(BASE_DELAY_MS * 0.999))
    expect(retryDelay(1, retryable, () => 0.999)).toBe(Math.floor(BASE_DELAY_MS * 2 * 0.999))
    expect(retryDelay(2, retryable, () => 0.999)).toBe(Math.floor(BASE_DELAY_MS * 4 * 0.999))
    expect(retryDelay(2, retryable, () => 0)).toBe(0)
  })
  it('never exceeds MAX_DELAY_MS however many attempts', () => {
    expect(retryDelay(20, retryable, () => 0.999)).toBeLessThanOrEqual(MAX_DELAY_MS)
  })
})
