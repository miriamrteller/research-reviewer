import { QueryErrorResetBoundary } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { describeError } from '../lib/describeError'
import { Button } from './Button'

/**
 * Catches errors thrown by suspense queries (or anything else) below it and
 * offers a reset that also clears TanStack Query's error state, so "Retry"
 * genuinely refetches rather than re-rendering a cached failure.
 */
export function AsyncBoundary({ children }: { children: ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={AsyncErrorFallback}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

function AsyncErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div
      role="alert"
      className="grid gap-3 rounded-md bg-error-container p-4 text-on-error-container"
    >
      <p className="type-title-small">Something went wrong</p>
      <p className="type-body-medium">{describeError(error)}</p>
      <div>
        <Button variant="tonal" onClick={resetErrorBoundary}>
          Retry
        </Button>
      </div>
    </div>
  )
}
