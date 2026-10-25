import { queryOptions, useMutation, useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { request } from './client'

/**
 * The reference resource module. Copy this shape for every real resource:
 *   1. a Zod schema (the single source of the TypeScript type)
 *   2. a key factory (so invalidation is never a string match)
 *   3. `queryOptions` (reusable from hooks, prefetching, loaders, tests)
 *   4. thin hooks
 */

export const HealthSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  version: z.string(),
  timestamp: z.string(),
})
export type Health = z.infer<typeof HealthSchema>

export const healthKeys = {
  all: ['health'] as const,
}

export function healthQuery() {
  return queryOptions({
    queryKey: healthKeys.all,
    queryFn: ({ signal }) => request('/api/health', { parse: HealthSchema.parse, signal }),
  })
}

export function useHealth() {
  return useQuery(healthQuery())
}

export const EchoSchema = z.object({
  received: z.unknown(),
  at: z.string(),
})
export type Echo = z.infer<typeof EchoSchema>

/** A write. Mutations are not retried automatically — see src/api/retry.ts. */
export function useEcho() {
  return useMutation({
    mutationFn: (payload: unknown) =>
      request('/api/echo', { method: 'POST', body: payload, parse: EchoSchema.parse }),
  })
}
