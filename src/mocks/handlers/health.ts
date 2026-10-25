import { http, HttpResponse } from 'msw'
import { applyScenario } from '../applyScenario'

/**
 * Schema-free endpoints that exist to prove the API layer's policy:
 *   GET  /api/health   a read   → exercised by retries, timeouts, validation
 *   POST /api/echo     a write  → exercised by the no-auto-retry rule for mutations
 * Real resources add their own handler files next to this one.
 */

export const healthHandlers = [
  http.get('/api/health', async () => {
    const override = await applyScenario('GET /api/health')
    if (override) return override
    return HttpResponse.json({
      status: 'ok',
      version: '0.1.0-mock',
      timestamp: new Date().toISOString(),
    })
  }),

  http.post('/api/echo', async ({ request }) => {
    const override = await applyScenario('POST /api/echo')
    if (override) return override
    const body = await request.json()
    return HttpResponse.json({ received: body, at: new Date().toISOString() })
  }),
]
