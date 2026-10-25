// Secondary FAB for feedback on the workspace itself. Fixed bottom right from 600px, in flow below.
import { MessageSquare } from 'lucide-react'

export function FeedbackFab() {
  return (
    // Drawn but inert: the feedback dialog is a later sub-flow.
    <button
      type="button"
      className="inline-flex h-14 items-center gap-3 self-end rounded-lg bg-secondary-container px-4 type-label-large text-on-secondary-container shadow-elevation-3 hover:bg-secondary-container/92 sm:fixed sm:right-6 sm:bottom-6"
    >
      <MessageSquare aria-hidden="true" className="size-5" />
      Feedback
    </button>
  )
}
