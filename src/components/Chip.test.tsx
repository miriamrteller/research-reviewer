import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AssistChip, FilterChip, InputChip } from './Chip'

/**
 * Role-based checks: what a screen reader reads for each chip, independent of styling.
 */
describe('chips', () => {
  it('filter chip is a toggle button whose selection is exposed as aria-pressed', () => {
    const { rerender } = render(<FilterChip>Report</FilterChip>)
    expect(screen.getByRole('button', { name: 'Report', pressed: false })).toBeInTheDocument()

    rerender(<FilterChip selected>Report</FilterChip>)
    expect(screen.getByRole('button', { name: 'Report', pressed: true })).toBeInTheDocument()
  })

  it('input chip names its icon-only remove button after the value it removes', async () => {
    const onRemove = vi.fn()
    render(<InputChip label="Research" onRemove={onRemove} />)

    const remove = screen.getByRole('button', { name: 'Remove Research' })
    expect(remove.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')

    await userEvent.setup().click(remove)
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('assist chip reads only its text; the leading icon is decorative', () => {
    render(<AssistChip>Add tag</AssistChip>)
    const chip = screen.getByRole('button', { name: 'Add tag' })
    expect(chip).toHaveAccessibleName('Add tag')
    expect(chip.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
