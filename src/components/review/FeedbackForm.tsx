// The feedback form's three fields: ease 1 to 5, a topic and an optional comment.
import { TriangleAlert } from 'lucide-react'
import { TextAreaField } from '../TextField'

const topics = [
  { value: 'badges', label: 'Badges and the key' },
  { value: 'sources', label: 'Sources and quotes' },
  { value: 'editing', label: 'Editing and approving' },
  { value: 'other', label: 'Something else' },
] as const

export function FeedbackForm({ failed }: { failed: boolean }) {
  return (
    <>
      <fieldset className="grid gap-2">
        <legend className="mb-2 type-label-large">How easy was the review? (1 hard, 5 easy)</legend>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              className="inline-flex min-h-10 min-w-10 items-center justify-center gap-1 rounded-full border border-outline px-3 type-label-large has-checked:bg-secondary-container has-checked:text-on-secondary-container has-focus-visible:outline-2 has-focus-visible:outline-primary"
            >
              <input type="radio" name="ease" value={n} required className="sr-only" />
              {n}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-1">
        <label htmlFor="feedback-topic" className="type-label-large">
          Topic
        </label>
        <select
          id="feedback-topic"
          name="topic"
          defaultValue="badges"
          className="min-h-10 rounded-xs border border-outline bg-surface-container-highest px-3 type-body-large text-on-surface"
        >
          {topics.map((topic) => (
            <option key={topic.value} value={topic.value}>
              {topic.label}
            </option>
          ))}
        </select>
      </div>
      <TextAreaField
        id="feedback-comment"
        name="comment"
        label="Comment (optional)"
        rows={3}
        aria-describedby={failed ? 'feedback-error' : undefined}
      />
      {failed ? (
        <p
          id="feedback-error"
          role="alert"
          className="inline-flex items-center gap-2 type-body-medium text-error"
        >
          <TriangleAlert aria-hidden="true" className="size-4" />
          Your feedback was not sent. Check the connection and send it again.
        </p>
      ) : null}
    </>
  )
}
