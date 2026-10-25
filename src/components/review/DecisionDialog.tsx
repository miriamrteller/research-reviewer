// Shared Base UI dialog frame for Approve and Revise: trigger, modal popup, title and description.
// The form inside is the caller's; the screen owns whether it is open.
import { Dialog } from '@base-ui/react/dialog'
import type { ReactNode } from 'react'
import { buttonClass, type ButtonVariant } from '../button-styles'

type DecisionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerLabel: string
  triggerVariant: ButtonVariant
  title: string
  description: string
  children: ReactNode
}

export function DecisionDialog({
  open,
  onOpenChange,
  triggerLabel,
  triggerVariant,
  title,
  description,
  children,
}: DecisionDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger className={buttonClass(triggerVariant)}>{triggerLabel}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-scrim/32" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 grid w-[min(90vw,32rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-surface-container-high p-6 text-on-surface shadow-elevation-3 outline-none">
          <Dialog.Title className="type-headline-small">{title}</Dialog.Title>
          <Dialog.Description className="type-body-medium text-on-surface-variant">
            {description}
          </Dialog.Description>
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

type DialogActionsProps = {
  confirmLabel: string
  pending: boolean
  disabled?: boolean
  error: string | null
}

/** Cancel and confirm, with the write's error shown above them. A failed write is never retried
 * on its own: the reviewer presses the button again. */
export function DialogActions({ confirmLabel, pending, disabled, error }: DialogActionsProps) {
  return (
    <>
      {error && (
        <p
          role="alert"
          className="rounded-sm bg-error-container p-3 type-body-medium text-on-error-container"
        >
          {error} Nothing was saved. Try again.
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Dialog.Close className={buttonClass('text')}>Cancel</Dialog.Close>
        <button type="submit" disabled={pending || disabled} className={buttonClass('filled')}>
          {pending ? 'Saving…' : confirmLabel}
        </button>
      </div>
    </>
  )
}
