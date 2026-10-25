// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { ApiError, parseRetryAfter } from './errors'

describe('ApiError.retryable', () => {
  it.each([
    ['network', undefined, true],
    ['timeout', undefined, true],
    ['http', 500, true],
    ['http', 503, true],
    ['http', 408, true],
    ['http', 425, true],
    ['http', 429, true],
    ['http', 400, false],
    ['http', 401, false],
    ['http', 403, false],
    ['http', 404, false],
    ['http', 422, false],
    ['validation', 200, false],
    ['abort', undefined, false],
  ] as const)('%s %s → retryable=%s', (kind, status, expected) => {
    expect(new ApiError('x', { kind, status }).retryable).toBe(expected)
  })
})

describe('parseRetryAfter', () => {
  it('reads delay-seconds', () => {
    expect(parseRetryAfter('2')).toBe(2000)
    expect(parseRetryAfter('0')).toBe(0)
  })
  it('reads an HTTP-date in the future', () => {
    const inFiveSeconds = new Date(Date.now() + 5000).toUTCString()
    const ms = parseRetryAfter(inFiveSeconds)
    expect(ms).toBeGreaterThan(3000)
    expect(ms).toBeLessThanOrEqual(5000)
  })
  it('clamps past dates to zero and ignores garbage', () => {
    expect(parseRetryAfter(new Date(Date.now() - 5000).toUTCString())).toBe(0)
    expect(parseRetryAfter('soon')).toBeUndefined()
    expect(parseRetryAfter(null)).toBeUndefined()
  })
})
