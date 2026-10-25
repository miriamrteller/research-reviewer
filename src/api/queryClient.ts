import { QueryClient } from '@tanstack/react-query'
import { retryDelay, shouldRetry } from './retry'

export interface QueryClientOptions {
  /** Override the backoff, e.g. `() => 0` in tests so retries are instant. */
  retryDelay?: (failureCount: number, error: unknown) => number
}

/**
 * Server-state policy for the whole app, declared once.
 * Queries retry per src/api/retry.ts; mutations never retry on their own.
 */
export function createQueryClient({ retryDelay: delay = retryDelay }: QueryClientOptions = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        retryDelay: delay,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export const queryClient = createQueryClient()
