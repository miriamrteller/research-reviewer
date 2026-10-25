import type { ComponentProps } from 'react'
import { cn } from '../lib/cn'

export interface TextAreaFieldProps extends ComponentProps<'textarea'> {
  id: string
  label: string
  supportingText?: string
}

/**
 * M3 filled text field, multiline.
 * The editable region is signalled the way M3 does it: a tonal
 * `surface-container-highest` fill with rounded top corners and an active
 * indicator line along the bottom that thickens to `primary` on focus.
 */
export function TextAreaField({
  id,
  label,
  supportingText,
  className,
  rows = 8,
  ...props
}: TextAreaFieldProps) {
  const supportingId = supportingText ? `${id}-supporting` : undefined

  return (
    <div className={cn('grid gap-1', className)}>
      <div
        data-focus-indicator="active-line"
        className={
          'group relative rounded-t-xs bg-surface-container-highest ' +
          'border-b border-on-surface-variant ' +
          'focus-within:border-b-2 focus-within:border-primary hover:bg-on-surface/8'
        }
      >
        <label
          htmlFor={id}
          className="block px-4 pt-2 type-body-small text-on-surface-variant group-focus-within:text-primary"
        >
          {label}
        </label>
        <textarea
          id={id}
          rows={rows}
          aria-describedby={supportingId}
          className="block w-full resize-y bg-transparent px-4 pb-2 type-body-large text-on-surface outline-none placeholder:text-on-surface-variant"
          {...props}
        />
      </div>
      {supportingText ? (
        <p id={supportingId} className="px-4 type-body-small text-on-surface-variant">
          {supportingText}
        </p>
      ) : null}
    </div>
  )
}
