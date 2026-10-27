// The page heading: the question the AI researched, the review state under it, and the badge key.
// The header is tinted by review state so a decided answer looks different at a glance. While the
// review loads, the question and state are skeletons and the badge key already works; the header
// stays mounted when the words arrive, so an open badge key stays open.
import type { ReviewState } from '../../api/review/schema'
import { cn } from '../../lib/cn'
import { Skeleton } from '../Skeleton'
import { BadgeKey } from './BadgeKey'
import { ReviewStatus } from './ReviewStatus'
import { reviewLooks } from './reviewLooks'

type QuestionHeaderProps = {
  /** Absent while the review loads. */
  review?: { question: string; state: ReviewState }
}

export function QuestionHeader({ review }: QuestionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-4 rounded-lg px-4 py-4 sm:px-6',
        reviewLooks[review?.state.status ?? 'review'].tint,
      )}
    >
      {review ? (
        <div className="grid gap-2">
          <h1 id="page-title" tabIndex={-1} className="type-headline-small">
            {review.question}
          </h1>
          <ReviewStatus state={review.state} />
        </div>
      ) : (
        <div className="grid flex-1 gap-2">
          <Skeleton typeClass="type-headline-small" lines={['w-4/5']} />
          <Skeleton typeClass="type-label-large" lines={['w-24']} />
        </div>
      )}
      <BadgeKey />
    </div>
  )
}
