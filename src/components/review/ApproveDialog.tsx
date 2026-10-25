// Approve: one confirmation checkbox and an optional note, sent as one write.
import { Checkbox } from '@base-ui/react/checkbox'
import { Check } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { TextAreaField } from '../TextField'
import { DecisionDialog, DialogActions } from './DecisionDialog'

type ApproveDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove: (note: string | undefined) => void
  pending: boolean
  error: string | null
}

export function ApproveDialog({
  open,
  onOpenChange,
  onApprove,
  pending,
  error,
}: ApproveDialogProps) {
  const [checked, setChecked] = useState(false)
  const [note, setNote] = useState('')

  function handleOpenChange(next: boolean) {
    if (next) {
      setChecked(false)
      setNote('')
    }
    onOpenChange(next)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!checked) return
    onApprove(note.trim() || undefined)
  }

  return (
    <DecisionDialog
      open={open}
      onOpenChange={handleOpenChange}
      triggerLabel="Approve"
      triggerVariant="filled"
      title="Approve this answer?"
      description="Approving makes the answer read-only and records your name and the time."
    >
      <form onSubmit={submit} className="grid gap-4">
        <div className="flex items-start gap-3">
          <Checkbox.Root
            id="approve-confirm"
            checked={checked}
            onCheckedChange={setChecked}
            className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-xs border-2 border-on-surface-variant data-[checked]:border-primary data-[checked]:bg-primary"
          >
            <Checkbox.Indicator className="text-on-primary">
              <Check aria-hidden="true" className="size-4" />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <label htmlFor="approve-confirm" className="type-body-large">
            I have read the claims and checked their sources.
          </label>
        </div>
        <TextAreaField
          id="approve-note"
          label="Note (optional)"
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <DialogActions confirmLabel="Approve" pending={pending} disabled={!checked} error={error} />
      </form>
    </DecisionDialog>
  )
}
