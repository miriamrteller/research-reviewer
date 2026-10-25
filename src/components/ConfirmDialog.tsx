import { Dialog } from '@base-ui/react/dialog'
import { buttonClass, type ButtonVariant } from './button-styles'

export interface ConfirmDialogProps {
  /** Text of the button that opens the dialog. */
  triggerLabel: string
  triggerVariant?: ButtonVariant
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
}

/**
 * Modal confirmation dialog on Base UI. Focus trap, Escape-to-close, focus
 * return and title/description wiring all come from the primitive.
 * No side effects yet: both actions simply close the dialog.
 */
export function ConfirmDialog({
  triggerLabel,
  triggerVariant = 'filled',
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
}: ConfirmDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className={buttonClass(triggerVariant)}>{triggerLabel}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-scrim/32" />
        <Dialog.Popup
          className={
            'fixed top-1/2 left-1/2 w-[min(90vw,28rem)] -translate-x-1/2 -translate-y-1/2 ' +
            'rounded-xl bg-surface-container-high p-6 text-on-surface shadow-elevation-3 outline-none'
          }
        >
          <Dialog.Title className="type-headline-small mb-4">{title}</Dialog.Title>
          <Dialog.Description className="type-body-medium mb-6 text-on-surface-variant">
            {description}
          </Dialog.Description>
          <div className="flex justify-end gap-2">
            <Dialog.Close className={buttonClass('text')}>{cancelLabel}</Dialog.Close>
            <Dialog.Close className={buttonClass('filled')}>{confirmLabel}</Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
