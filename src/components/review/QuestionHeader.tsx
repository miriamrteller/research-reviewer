// The page heading: the question the AI researched, the review state under it, and the badge key.
// The header is tinted by review state so a decided answer looks different at a glance.
import { KeyRound } from 'lucide-react'
import type { ReviewState } from '../../api/review/schema'
import { cn } from '../../lib/cn'
import { buttonClass } from '../button-styles'
import { ReviewStatus } from './ReviewStatus'
import { reviewLooks } from './reviewLooks'

type QuestionHeaderProps = {
  question: string
  state: ReviewState
}

export function QuestionHeader({ question, state }: QuestionHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 rounded-lg px-6 py-4',
        reviewLooks[state.status].tint,
      )}
    >
      <div className="grid gap-2">
        <h1 id="page-title" tabIndex={-1} className="type-headline-small">
          {question}
        </h1>
        <ReviewStatus state={state} />
      </div>
      {/* Drawn but inert: the key is a later sub-flow. */}
      <button type="button" className={buttonClass('outlined', 'shrink-0')}>
        <KeyRound aria-hidden="true" className="size-4" />
        Badge key
      </button>
    </div>
  )
}
