import { cn } from '../lib/cn'

export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text'

const base =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-6 type-label-large ' +
  'transition-colors duration-(--md-sys-motion-duration-short4) ease-standard ' +
  'disabled:pointer-events-none disabled:opacity-38'

const variants: Record<ButtonVariant, string> = {
  filled: 'bg-primary text-on-primary hover:bg-primary/92',
  tonal: 'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/92',
  outlined: 'border border-outline text-primary hover:bg-primary/8',
  text: 'text-primary hover:bg-primary/8',
}

/**
 * M3 common-button classes. Shared by <Button> and by Base UI parts that
 * render as buttons (Dialog.Trigger, Menu.Trigger, Select.Trigger).
 */
export function buttonClass(variant: ButtonVariant = 'filled', className?: string): string {
  return cn(base, variants[variant], className)
}
