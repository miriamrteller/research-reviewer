// ApiHealthToast — shows GET /api/health as one toast that updates in place:
//   checking / retrying n/3   polite, stays until there is an outcome
//   API ok                    polite, closes itself after OK_TIMEOUT_MS (paused on hover/focus)
//   API unavailable + Retry   polite, stays until Retry or dismiss
// Every state uses Base UI's polite priority. Its urgent priority reads a hidden copy out as an
// alert and hides the visible toast, Retry included, from screen readers until it has focus,
// which axe flags (aria-hidden-focus). A screen's own load error in main stays an alert.
// It renders nothing itself; Toaster draws the toast. The query stays the source of truth: the
// toast is only told when the health state changes, so a dismissed toast stays dismissed.
import { Toast } from '@base-ui/react/toast'
import { useEffect, useEffectEvent } from 'react'
import { useHealth } from '../api/health'
import { MAX_RETRIES } from '../api/retry'
import { describeError } from '../lib/describeError'

const TOAST_ID = 'api-health'

/** M3 snackbars show for 4 to 10 seconds; a short status line needs the low end plus slack. */
export const OK_TIMEOUT_MS = 6_000

export type ApiHealthToastProps = {
  /** Where focus goes if the toast closes while it holds focus, so it never drops to <body>. */
  returnFocusTo: () => HTMLElement | null
  /** How long "API ok" stays. Tests shorten it rather than fake the clock under MSW. */
  okTimeoutMs?: number
}

export function ApiHealthToast({
  returnFocusTo,
  okTimeoutMs = OK_TIMEOUT_MS,
}: ApiHealthToastProps) {
  const { data, error, isPending, isError, failureCount, refetch } = useHealth()
  const toastManager = Toast.useToastManager()

  const kind = isError ? 'error' : isPending ? 'loading' : 'success'
  const title = isError
    ? 'API unavailable'
    : isPending
      ? failureCount > 0
        ? `Retrying ${failureCount}/${MAX_RETRIES}…`
        : 'Checking API…'
      : `API ${data.status} · v${data.version}`
  const description = isError ? describeError(error) : undefined

  // An effect event, so the toast is only told when what it says changes, not on every render.
  const show = useEffectEvent(() => {
    // Toaster gives each toast its id as the element id.
    const toastElement = () => document.getElementById(TOAST_ID)
    function keepFocus() {
      if (toastElement()?.contains(document.activeElement)) {
        returnFocusTo()?.focus({ preventScroll: true })
      }
    }

    // Adding with the same id updates the one toast in place, so the live region announces the
    // new text instead of a second toast appearing.
    toastManager.add({
      id: TOAST_ID,
      title,
      description,
      type: kind,
      priority: 'low',
      onClose: keepFocus,
      ...(kind === 'error'
        ? {
            timeout: 0,
            actionProps: {
              children: 'Retry',
              onClick: () => {
                // The Retry button is about to disappear: hold focus on the toast itself,
                // which then reads out the retry progress.
                toastElement()?.focus()
                void refetch()
              },
            },
          }
        : { timeout: okTimeoutMs, actionProps: undefined }),
    })
  })

  useEffect(() => show(), [kind, title, description])

  return null
}
