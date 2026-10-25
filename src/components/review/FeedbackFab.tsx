// Feedback on the workspace: the bottom-right FAB opens a Base UI dialog with a short form.
// Presentational: the container sends the form and passes the result back in.
import { Dialog } from '@base-ui/react/dialog'
import { CircleCheck, MessageSquare } from 'lucide-react'
import type { FormEvent } from 'react'
import {
  FeedbackTopicSchema,
  type FeedbackInput,
  type FeedbackReceipt,
} from '../../api/feedback/feedback'
import { buttonClass } from '../button-styles'
import { FeedbackForm } from './FeedbackForm'

type FeedbackFabProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend: (input: Omit<FeedbackInput, 'by'>) => void
  sending: boolean
  failed: boolean
  receipt: FeedbackReceipt | undefined
}

export function FeedbackFab({
  open,
  onOpenChange,
  onSend,
  sending,
  failed,
  receipt,
}: FeedbackFabProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    onSend({
      ease: Number(data.get('ease')),
      topic: FeedbackTopicSchema.parse(data.get('topic')),
      comment: String(data.get('comment') ?? ''),
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger className="inline-flex h-14 items-center gap-3 self-end rounded-lg bg-secondary-container px-4 type-label-large text-on-secondary-container shadow-elevation-3 hover:bg-secondary-container/92 sm:fixed sm:right-6 sm:bottom-6">
        <MessageSquare aria-hidden="true" className="size-5" />
        Feedback
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-30 bg-scrim/32" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-30 max-h-[90dvh] w-[min(90vw,28rem)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl bg-surface-container-high p-6 text-on-surface shadow-elevation-3 outline-none">
          <Dialog.Title className="mb-2 type-headline-small">
            Feedback on this workspace
          </Dialog.Title>
          {receipt ? (
            <div className="grid gap-4">
              <p className="inline-flex items-center gap-2 type-body-large">
                <CircleCheck aria-hidden="true" className="size-5 text-primary" />
                Thank you. Your feedback was sent.
              </p>
              <p className="type-body-medium text-on-surface-variant">
                Sent by {receipt.sent.by} at{' '}
                <time dateTime={receipt.sent.at}>{new Date(receipt.sent.at).toLocaleString()}</time>
              </p>
              <Dialog.Close className={buttonClass('filled', 'justify-self-end')}>
                Close
              </Dialog.Close>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <Dialog.Description className="type-body-medium text-on-surface-variant">
                Tell us how the review screen worked for you. Your name and the time are sent with
                it.
              </Dialog.Description>
              <FeedbackForm failed={failed} />
              <div className="flex justify-end gap-2">
                <Dialog.Close className={buttonClass('text')}>Cancel</Dialog.Close>
                <button type="submit" disabled={sending} className={buttonClass('filled')}>
                  {sending ? 'Sending…' : 'Send feedback'}
                </button>
              </div>
            </form>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
