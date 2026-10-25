import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { requestLog } from '../mocks/applyScenario'
import { setScenario } from '../mocks/scenario'
import { useEcho, useHealth } from './health'
import { createQueryClient } from './queryClient'
import { MAX_RETRIES } from './retry'

/** A fresh client per test with instant retries — the policy, minus the waiting. */
function wrapper() {
  const client = createQueryClient({ retryDelay: () => 0 })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe('useHealth — the read-side retry policy, end to end', () => {
  it('loads on the happy path with a single request', async () => {
    const { result } = renderHook(() => useHealth(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.status).toBe('ok')
    expect(requestLog).toHaveLength(1)
  })

  it('recovers from transient failures by retrying (flaky: 503, 503, 200)', async () => {
    setScenario('flaky')
    const { result } = renderHook(() => useHealth(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(requestLog).toHaveLength(3)
    expect(result.current.failureCount).toBe(0) // reset after success
  })

  it('gives up after MAX_RETRIES retries when the server stays down', async () => {
    setScenario('down')
    const { result } = renderHook(() => useHealth(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 })
    expect(requestLog).toHaveLength(1 + MAX_RETRIES)
    expect(result.current.error).toMatchObject({ kind: 'http', status: 503 })
  })

  it('does not retry a 404', async () => {
    setScenario('notfound')
    const { result } = renderHook(() => useHealth(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(requestLog).toHaveLength(1)
  })

  it('does not retry a payload that fails validation', async () => {
    setScenario('invalid')
    const { result } = renderHook(() => useHealth(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(requestLog).toHaveLength(1)
    expect(result.current.error).toMatchObject({ kind: 'validation' })
  })
})

describe('useEcho — writes are never retried automatically', () => {
  it('fails once and stops, even on a retryable 503', async () => {
    setScenario('down')
    const { result } = renderHook(() => useEcho(), { wrapper: wrapper() })
    result.current.mutate({ hello: 'world' })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(requestLog).toHaveLength(1)
  })

  it('succeeds and returns the echoed payload', async () => {
    const { result } = renderHook(() => useEcho(), { wrapper: wrapper() })
    result.current.mutate({ hello: 'world' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.received).toEqual({ hello: 'world' })
  })
})
