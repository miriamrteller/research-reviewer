import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from '../test/axe'
import { ConfirmDialog } from './ConfirmDialog'

function renderDialog() {
  return render(
    <ConfirmDialog
      triggerLabel="Submit"
      title="Submit for review?"
      description="The summary will be locked."
      confirmLabel="Submit"
    />,
  )
}

describe('ConfirmDialog', () => {
  it('opens on activation and has no WCAG violations while open', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    const dialog = await screen.findByRole('dialog', { name: 'Submit for review?' })
    expect(dialog).toHaveAccessibleDescription('The summary will be locked.')
    // Scan the whole document: the dialog renders through a portal.
    expect(await axe(document.body)).toHaveNoViolations()
  })

  it('closes on Escape and returns focus to the trigger (WCAG 2.4.3)', async () => {
    const user = userEvent.setup()
    renderDialog()
    const trigger = screen.getByRole('button', { name: 'Submit' })

    await user.click(trigger)
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it('is operable entirely from the keyboard', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.tab()
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus()
    await user.keyboard('{Enter}')
    await screen.findByRole('dialog')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
