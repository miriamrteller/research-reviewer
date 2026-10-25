// The review state under the question: icon, word and tint together, plus who decided and when.
import type { ReviewState } from '../../api/review/schema'
import { formatAt } from '../../lib/formatStamp'
import { reviewLooks as looks } from './reviewLooks'

type ReviewStatusProps = {
  state: ReviewState
}

export function ReviewStatus({ state }: ReviewStatusProps) {
  const { icon: Icon, word } = looks[state.status]
  return (
    // Focus lands here after Approve or Revise, because the buttons that were used are gone.
    <div id="review-status" tabIndex={-1} className="grid gap-1 rounded-sm">
      <p className="inline-flex flex-wrap items-center gap-1 type-label-large">
        <Icon aria-hidden="true" className="size-4" />
        <strong>{word}</strong>
        {state.status !== 'review' && (
          <span>
            {' '}
            by {state.by} · <time dateTime={state.at}>{formatAt(state.at)}</time>
          </span>
        )}
      </p>
      {state.status === 'approved' && state.note && (
        <p className="type-body-medium">Note: {state.note}</p>
      )}
      {state.status === 'revision_needed' && (
        <p className="type-body-medium">Reason: {state.reason}</p>
      )}
    </div>
  )
}
