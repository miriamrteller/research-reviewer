// Revise: sends the whole answer back with a required reason, as one write.
import { useState, type FormEvent } from 'react'
import { TextAreaField } from '../TextField'
import { DecisionDialog, DialogActions } from './DecisionDialog'

type ReviseDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRevise: (reason: string) => void
  pending: boolean
  error: string | null
}

const HINT = 'Say what needs to change. The answer becomes read-only.'
const MISSING = 'Write a reason before sending the answer back.'

export function ReviseDialog({ open, onOpenChange, onRevise, pending, error }: ReviseDialogProps) {
  const [reason, setReason] = useState('')
  const [missing, setMissing] = useState(false)

  function handleOpenChange(next: boolean) {
    if (next) {
      setReason('')
      setMissing(false)
    }
    onOpenChange(next)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const trimmed = reason.trim()
    if (!trimmed) {
      setMissing(true)
      return
    }
    onRevise(trimmed)
  }

  return (
    <DecisionDialog
      open={open}
      onOpenChange={handleOpenChange}
      triggerLabel="Revise"
      triggerVariant="outlined"
      title="Send this answer back for revision?"
      description="The author gets your reason with your name and the time."
    >
      <form onSubmit={submit} noValidate className="grid gap-4">
        <TextAreaField
          id="revise-reason"
          label="Reason"
          rows={4}
          value={reason}
          aria-invalid={missing}
          supportingText={missing ? MISSING : HINT}
          onChange={(event) => setReason(event.target.value)}
        />
        <DialogActions confirmLabel="Send back" pending={pending} error={error} />
      </form>
    </DecisionDialog>
  )
}
