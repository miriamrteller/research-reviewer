import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { toHaveNoViolations } from 'jest-axe'
import { afterAll, afterEach, beforeAll, expect } from 'vitest'
import { requestLog } from '../mocks/applyScenario'
import { server } from '../mocks/node'
import { resetScenario } from '../mocks/scenario'

// Accessibility matcher: expect(await axe(container)).toHaveNoViolations()
expect.extend(toHaveNoViolations)

// Mock API for every test file: any request a handler does not cover is a test bug.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterAll(() => server.close())

// Globals are off, so React Testing Library's auto-cleanup must be wired here.
afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetScenario()
  requestLog.length = 0
})
