// One signal on a source card: icon and word always visible, colour from its value (ADR 001),
// with the group named for screen readers.
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/cn'
import { badgeTone, badgeToneClass } from './badge-tone'

type BadgeProps = {
  group: string
  label: string
  icon: LucideIcon
}

export function Badge({ group, label, icon: Icon }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-sm border px-2 type-label-medium',
        badgeToneClass[badgeTone(label)],
      )}
    >
      <Icon aria-hidden="true" className="size-4" />
      <span className="sr-only">{group}: </span>
      {label}
    </span>
  )
}
