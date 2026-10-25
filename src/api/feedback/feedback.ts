// Feedback on the workspace itself: schema, key factory and the one write. Types come from Zod.
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { request } from '../client'

export { REVIEWER } from '../../lib/reviewer'

export const FeedbackTopicSchema = z.enum(['badges', 'sources', 'editing', 'other'])
export type FeedbackTopic = z.infer<typeof FeedbackTopicSchema>

export const FeedbackInputSchema = z.strictObject({
  ease: z.number().int().min(1).max(5),
  topic: FeedbackTopicSchema,
  comment: z.string(),
  by: z.string().min(1),
})
export type FeedbackInput = z.infer<typeof FeedbackInputSchema>

export const FeedbackReceiptSchema = z.strictObject({
  sent: z.strictObject({ by: z.string().min(1), at: z.iso.datetime() }),
})
export type FeedbackReceipt = z.infer<typeof FeedbackReceiptSchema>

export const feedbackKeys = {
  all: ['feedback'] as const,
}

/** A write: never retried automatically, so one click sends one message. */
export function useSendFeedback() {
  return useMutation({
    mutationKey: feedbackKeys.all,
    retry: false,
    mutationFn: (input: FeedbackInput) =>
      request('/api/feedback', { method: 'POST', body: input, parse: FeedbackReceiptSchema.parse }),
  })
}
