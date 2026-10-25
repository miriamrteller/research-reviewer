// Review document resource: key factory, query options and thin hooks. Writes never auto-retry.
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { request } from '../client'
import { ReviewDocument, type ApproveBody, type ReviseBody } from './schema'

export const reviewKeys = {
  all: ['review'] as const,
  document: () => [...reviewKeys.all, 'document'] as const,
}

export function reviewDocumentQuery() {
  return queryOptions({
    queryKey: reviewKeys.document(),
    queryFn: ({ signal }) => request('/api/review', { parse: ReviewDocument.parse, signal }),
  })
}

export function useReviewDocument() {
  return useQuery(reviewDocumentQuery())
}

function useReviewWrite<TBody>(path: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (body: TBody) =>
      request(path, { method: 'POST', body, parse: ReviewDocument.parse }),
    retry: false,
    onSuccess: (doc) => client.setQueryData(reviewKeys.document(), doc),
  })
}

export function useApproveReview() {
  return useReviewWrite<ApproveBody>('/api/review/approve')
}

export function useReviseReview() {
  return useReviewWrite<ReviseBody>('/api/review/revise')
}
