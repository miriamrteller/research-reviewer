// The page heading: the question the AI researched, the review status under it, and the badge key.
import { Clock } from 'lucide-react'
import { BadgeKey } from './BadgeKey'

type QuestionHeaderProps = {
  question: string
  status: string
}

export function QuestionHeader({ question, status }: QuestionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="grid gap-2">
        <h1 id="page-title" tabIndex={-1} className="type-headline-small">
          {question}
        </h1>
        <p className="inline-flex items-center gap-1 type-label-large text-on-surface-variant">
          <Clock aria-hidden="true" className="size-4" />
          {status}
        </p>
      </div>
      <BadgeKey />
    </div>
  )
}
