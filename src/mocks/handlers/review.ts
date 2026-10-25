// Mock review API: one document held in memory, reset on page load and in tests.
// Writes are stamped here with the fictional reviewer and the server time.
import { http, HttpResponse } from 'msw'
import { ApproveBody, ReviseBody, type ReviewDocument } from '../../api/review/schema'
import { applyScenario } from '../applyScenario'
import { REVIEWER, reviewFixture } from '../fixtures/review'

let current: ReviewDocument = reviewFixture

export function resetReviewDocument() {
  current = reviewFixture
}

const notInReview = () =>
  HttpResponse.json({ error: 'This answer has already been decided' }, { status: 409 })

export const reviewHandlers = [
  http.get('/api/review', async () => {
    const override = await applyScenario('GET /api/review')
    if (override) return override
    return HttpResponse.json(current)
  }),

  http.post('/api/review/approve', async ({ request }) => {
    const override = await applyScenario('POST /api/review/approve')
    if (override) return override
    const body = ApproveBody.safeParse(await request.json())
    if (!body.success) return HttpResponse.json({ error: 'Invalid note' }, { status: 400 })
    if (current.review.status !== 'review') return notInReview()
    const stamp = { by: REVIEWER, at: new Date().toISOString() }
    current = { ...current, review: { status: 'approved', ...stamp, ...body.data } }
    return HttpResponse.json(current)
  }),

  http.post('/api/review/revise', async ({ request }) => {
    const override = await applyScenario('POST /api/review/revise')
    if (override) return override
    const body = ReviseBody.safeParse(await request.json())
    if (!body.success) return HttpResponse.json({ error: 'A reason is needed' }, { status: 400 })
    if (current.review.status !== 'review') return notInReview()
    const stamp = { by: REVIEWER, at: new Date().toISOString() }
    current = { ...current, review: { status: 'revision_needed', ...stamp, ...body.data } }
    return HttpResponse.json(current)
  }),
]
