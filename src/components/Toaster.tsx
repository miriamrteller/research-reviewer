// Toaster — the bottom-left notification area: Base UI Toast viewport and the M3 snackbar look.
// Base UI owns the accessibility: a polite live region named "Notifications", high-priority
// toasts also read out as an alert, timers pause on hover, focus and window blur, F6 or Tab
// reaches the toasts without anything stealing focus, and Escape closes the focused one.
// Which toasts exist is decided by the containers that call the toast manager.
import { Toast } from '@base-ui/react/toast'
import { CircleAlert, CircleCheck, LoaderCircle, X } from 'lucide-react'
import { cn } from '../lib/cn'
import { buttonClass } from './button-styles'

// The ring on controls inside the snackbar sits on inverse-surface, so it uses inverse-primary.
const onInverseFocus = 'focus-visible:outline-inverse-primary'

function ToastIcon({ type }: { type: string | undefined }) {
  const icon = 'size-5 shrink-0'
  if (type === 'loading') {
    return <LoaderCircle aria-hidden="true" className={cn(icon, 'motion-safe:animate-spin')} />
  }
  if (type === 'error') return <CircleAlert aria-hidden="true" className={icon} />
  return <CircleCheck aria-hidden="true" className={icon} />
}

function ToastList() {
  const { toasts } = Toast.useToastManager()
  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      id={toast.id}
      toast={toast}
      swipeDirection="left"
      className={cn(
        'flex min-h-12 items-center gap-3 rounded-xs bg-inverse-surface py-1 ps-4 pe-1 text-inverse-on-surface shadow-elevation-3',
        'motion-safe:transition-[opacity,translate] motion-safe:duration-(--md-sys-motion-duration-short4) motion-safe:ease-standard',
        'data-starting-style:translate-y-2 data-starting-style:opacity-0 data-ending-style:opacity-0',
      )}
    >
      <ToastIcon type={toast.type} />
      <div className="min-w-0 flex-1 py-2">
        <Toast.Title render={<p />} className="type-body-medium" />
        <Toast.Description render={<p />} className="type-body-small" />
      </div>
      <Toast.Action
        className={buttonClass('text', cn('px-3 text-inverse-primary', onInverseFocus))}
      />
      <Toast.Close
        aria-label="Dismiss notification"
        className={cn(
          'inline-flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-inverse-on-surface/8',
          onInverseFocus,
        )}
      >
        <X aria-hidden="true" className="size-5" />
      </Toast.Close>
    </Toast.Root>
  ))
}

export function Toaster() {
  return (
    <Toast.Portal>
      {/* Bottom-left, M3's place for a snackbar on wide screens. Full width minus the gutters on
          small screens. Move it if a screen puts its own fixed controls in that corner. */}
      <Toast.Viewport className="fixed bottom-4 left-4 z-20 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 outline-none sm:bottom-6 sm:left-6">
        <ToastList />
      </Toast.Viewport>
    </Toast.Portal>
  )
}
