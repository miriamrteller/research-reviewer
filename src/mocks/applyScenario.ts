import { delay, HttpResponse } from 'msw'
import { flakyShouldFail, getScenario, getSlowMs } from './scenario'

/** Every request an endpoint answers, in order. Tests assert on it to count retries. */
export const requestLog: string[] = []

/**
 * Call first in every handler:
 *
 *   const override = await applyScenario('GET /api/things')
 *   if (override) return override
 *
 * Returns an error response for the active scenario, or null when the handler
 * should answer normally (after any `slow` delay has elapsed).
 */
export async function applyScenario(endpoint: string) {
  requestLog.push(endpoint)
  switch (getScenario()) {
    case 'slow':
      await delay(getSlowMs())
      return null
    case 'down':
      return HttpResponse.json(
        { error: 'Service unavailable' },
        { status: 503, headers: { 'Retry-After': '1' } },
      )
    case 'notfound':
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    case 'flaky':
      return flakyShouldFail(endpoint)
        ? HttpResponse.json({ error: 'Temporarily unavailable' }, { status: 503 })
        : null
    case 'invalid':
      return HttpResponse.json({ unexpected: true })
    case 'ok':
    default:
      return null
  }
}
