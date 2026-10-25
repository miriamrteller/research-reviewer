import { QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { createQueryClient } from '../api/queryClient'

/** Render with the app's providers; retries are instant so tests exercise the policy without waiting. */
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  const client = createQueryClient({ retryDelay: () => 0 })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return { client, ...render(ui, { wrapper: Wrapper, ...options }) }
}
