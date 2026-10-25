// Container for workspace feedback: owns the dialog's open state and sends the form.
import { useState } from 'react'
import { REVIEWER, useSendFeedback } from '../api/feedback/feedback'
import { FeedbackFab } from '../components/review/FeedbackFab'

export function SendFeedback() {
  const [open, setOpen] = useState(false)
  const send = useSendFeedback()

  function handleOpenChange(next: boolean) {
    setOpen(next)
    // Each opening starts a fresh form.
    if (next) send.reset()
  }

  return (
    <FeedbackFab
      open={open}
      onOpenChange={handleOpenChange}
      onSend={(input) => send.mutate({ ...input, by: REVIEWER })}
      sending={send.isPending}
      failed={send.isError}
      receipt={send.data}
    />
  )
}
