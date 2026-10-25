import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { server } from '../mocks/node'
import { setScenario } from '../mocks/scenario'
import { request } from './client'
import { ApiError } from './errors'
import { HealthSchema } from './health'

async function failure(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise
  } catch (error) {
    if (error instanceof ApiError) return error
    throw new Error(`Expected ApiError, got ${String(error)}`)
  }
  throw new Error('Expected the request to fail')
}

describe('request()', () => {
  it('returns parsed, typed data on success', async () => {
    const health = await request('/api/health', { parse: HealthSchema.parse })
    expect(health.status).toBe('ok')
    expect(typeof health.version).toBe('string')
  })

  it('maps 404 to a non-retryable http error', async () => {
    setScenario('notfound')
    const error = await failure(request('/api/health', { parse: HealthSchema.parse }))
    expect(error).toMatchObject({ kind: 'http', status: 404, retryable: false })
  })

  it('maps 503 to a retryable http error and reads Retry-After', async () => {
    setScenario('down')
    const error = await failure(request('/api/health', { parse: HealthSchema.parse }))
    expect(error).toMatchObject({ kind: 'http', status: 503, retryable: true, retryAfterMs: 1000 })
  })

  it('maps a payload that fails validation to a non-retryable error', async () => {
    setScenario('invalid')
    const error = await failure(request('/api/health', { parse: HealthSchema.parse }))
    expect(error).toMatchObject({ kind: 'validation', status: 200, retryable: false })
    expect(error.cause).toBeInstanceOf(z.ZodError)
  })

  it('maps a non-JSON body to a validation error', async () => {
    server.use(http.get('/api/health', () => HttpResponse.text('<html>oops</html>')))
    const error = await failure(request('/api/health', { parse: HealthSchema.parse }))
    expect(error).toMatchObject({ kind: 'validation', retryable: false })
  })

  it('maps a network failure to a retryable error', async () => {
    server.use(http.get('/api/health', () => HttpResponse.error()))
    const error = await failure(request('/api/health', { parse: HealthSchema.parse }))
    expect(error).toMatchObject({ kind: 'network', retryable: true })
  })

  it('times out and reports it as retryable', async () => {
    setScenario('slow')
    const error = await failure(
      request('/api/health', { parse: HealthSchema.parse, timeoutMs: 50 }),
    )
    expect(error).toMatchObject({ kind: 'timeout', retryable: true })
  })

  it('reports caller cancellation as abort, not retryable', async () => {
    setScenario('slow')
    const controller = new AbortController()
    const pending = request('/api/health', { parse: HealthSchema.parse, signal: controller.signal })
    controller.abort()
    const error = await failure(pending)
    expect(error).toMatchObject({ kind: 'abort', retryable: false })
  })

  it('sends JSON bodies and parses the reply for writes', async () => {
    const reply = await request('/api/echo', {
      method: 'POST',
      body: { hello: 'world' },
      parse: z.object({ received: z.object({ hello: z.string() }) }).parse,
    })
    expect(reply.received.hello).toBe('world')
  })
})
