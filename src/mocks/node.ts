import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** MSW for Vitest: intercepts Node's fetch with the same handlers the browser uses. */
export const server = setupServer(...handlers)
