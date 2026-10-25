import { Toast } from '@base-ui/react/toast'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Toaster } from '../components/Toaster'
import { setScenario } from '../mocks/scenario'
import { axe } from '../test/axe'
import { renderWithProviders } from '../test/render'
import { ApiHealthToast } from './ApiHealthToast'

const SHORT = 300

function renderToast() {
  return renderWithProviders(
    <Toast.Provider limit={1}>
      <button type="button">Somewhere on the page</button>
      <h1 id="page-title" tabIndex={-1}>
        The page title
      </h1>
      <ApiHealthToast
        returnFocusTo={() => document.getElementById('page-title')}
        okTimeoutMs={SHORT}
      />
      <Toaster />
    </Toast.Provider>,
  )
}

const notifications = () => screen.getByRole('region', { name: 'Notifications' })
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('API health toast', () => {
  it('sees "Checking API…" then "API ok" in a polite notification that closes on its own', async () => {
    renderToast()
    expect(await screen.findByText('Checking API…')).toBeInTheDocument()
    expect(notifications()).toHaveAttribute('aria-live', 'polite')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    expect(await screen.findByText(/^API ok · v/)).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: /^API ok/ })).toBeInTheDocument()
    expect(await axe(document.body)).toHaveNoViolations()

    await waitFor(() => expect(screen.queryByText(/^API ok/)).not.toBeInTheDocument())
  })

  it('keeps "API ok" on screen while the pointer rests on it', async () => {
    renderToast()
    const user = userEvent.setup()
    await user.hover(await screen.findByRole('dialog', { name: /^API ok/ }))
    await wait(SHORT * 3)
    expect(screen.getByRole('dialog', { name: /^API ok/ })).toBeInTheDocument()

    await user.unhover(screen.getByRole('dialog', { name: /^API ok/ }))
    await waitFor(() => expect(screen.queryByText(/^API ok/)).not.toBeInTheDocument())
  })

  it('hovers a notification and dismisses it with its close button', async () => {
    renderToast()
    const user = userEvent.setup()
    await user.hover(await screen.findByRole('dialog', { name: 'Checking API…' }))
    await user.click(screen.getByRole('button', { name: 'Dismiss notification' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('sees the API is down with Retry, without focus moving, and the toast stays', async () => {
    setScenario('down')
    renderToast()
    const toast = await screen.findByRole('dialog', { name: 'API unavailable' }, { timeout: 5000 })
    expect(toast).toHaveAccessibleDescription(/HTTP 503/)
    expect(within(notifications()).getByRole('button', { name: 'Retry' })).toBeVisible()
    expect(document.body).toHaveFocus()
    expect(await axe(document.body)).toHaveNoViolations()

    await wait(SHORT * 3)
    expect(screen.getByRole('dialog', { name: 'API unavailable' })).toBeInTheDocument()
  })

  it('reaches Retry with Tab, retries, and focus stays on the toast, then returns to the page', async () => {
    setScenario('down')
    renderToast()
    await screen.findByRole('dialog', { name: 'API unavailable' }, { timeout: 5000 })
    const user = userEvent.setup()

    // The toast is last in the tab order, after the page.
    await user.click(screen.getByRole('button', { name: 'Somewhere on the page' }))
    await user.tab()
    expect(screen.getByRole('dialog', { name: 'API unavailable' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Retry' })).toHaveFocus()

    setScenario('ok')
    await user.keyboard('{Enter}')
    const toast = await screen.findByRole('dialog', { name: /^API ok/ })
    expect(toast).toHaveFocus()

    // Keyboard focus pauses the timer; Escape closes the toast and focus lands back on the page.
    await wait(SHORT * 3)
    expect(toast).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByRole('heading', { name: 'The page title' })).toHaveFocus()
  })
})
