// A minor error on one source: its full text could not be loaded, while the title, checks and
// quote still show (Miriam). Icon and words, so it never relies on colour alone.
import { CircleAlert } from 'lucide-react'

export function FullTextMissing() {
  return (
    <p className="inline-flex items-start gap-1 type-body-small text-on-surface-variant">
      <CircleAlert aria-hidden="true" className="mt-px size-4 shrink-0 text-error" />
      <span>
        <strong className="text-on-surface">Full text missing.</strong> The source document could
        not be loaded.
      </span>
    </p>
  )
}
