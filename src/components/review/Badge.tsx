// One signal on a source card: icon and word always visible, with the group named for screen readers.
import type { LucideIcon } from 'lucide-react'

type BadgeProps = {
  group: string
  label: string
  icon: LucideIcon
}

export function Badge({ group, label, icon: Icon }: BadgeProps) {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-sm border border-outline-variant px-2 type-label-medium text-on-surface-variant">
      <Icon aria-hidden="true" className="size-4" />
      <span className="sr-only">{group}: </span>
      {label}
    </span>
  )
}
