import { Plus, X } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '../lib/cn'

const chipBase =
  'inline-flex h-8 items-center gap-2 rounded-sm px-3 type-label-large ' +
  'transition-colors duration-(--md-sys-motion-duration-short4) ease-standard'

/** M3 filter chip: a toggle. `selected` drives aria-pressed and the tonal fill. */
export interface FilterChipProps extends Omit<ComponentProps<'button'>, 'type'> {
  selected?: boolean
}

export function FilterChip({ selected = false, className, children, ...props }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        chipBase,
        selected
          ? 'bg-secondary-container text-on-secondary-container'
          : 'border border-outline text-on-surface-variant hover:bg-on-surface/8',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/** M3 input chip: a removable value (a tag, a recipient). */
export interface InputChipProps {
  label: string
  onRemove?: () => void
  className?: string
}

export function InputChip({ label, onRemove, className }: InputChipProps) {
  return (
    <span className={cn(chipBase, 'border border-outline pr-1 text-on-surface-variant', className)}>
      {label}
      <button
        type="button"
        aria-label={`Remove ${label}`}
        onClick={onRemove}
        className="inline-flex size-6 items-center justify-center rounded-full hover:bg-on-surface/8"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </span>
  )
}

/** M3 assist chip: a contextual action. */
export type AssistChipProps = Omit<ComponentProps<'button'>, 'type'>

export function AssistChip({ className, children, ...props }: AssistChipProps) {
  return (
    <button
      type="button"
      className={cn(
        chipBase,
        'border border-outline text-on-surface hover:bg-on-surface/8',
        className,
      )}
      {...props}
    >
      <Plus aria-hidden="true" className="size-4 text-primary" />
      {children}
    </button>
  )
}
