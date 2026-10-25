// Mock POST /api/feedback: validates the body, keeps it in memory and stamps who and when.
import { http, HttpResponse } from 'msw'
import { FeedbackInputSchema, type FeedbackInput } from '../../api/feedback/feedback'
import { applyScenario } from '../applyScenario'

let received: Array<FeedbackInput & { at: string }> = []

/** What the mock has received, for tests. */
export function receivedFeedback() {
  return received
}

export function resetFeedback() {
  received = []
}

export const feedbackHandlers = [
  http.post('/api/feedback', async ({ request }) => {
    const override = await applyScenario('POST /api/feedback')
    if (override) return override
    const body = FeedbackInputSchema.safeParse(await request.json())
    if (!body.success) return HttpResponse.json({ error: 'Invalid feedback' }, { status: 400 })
    const at = new Date().toISOString()
    received.push({ ...body.data, at })
    return HttpResponse.json({ sent: { by: body.data.by, at } })
  }),
]
