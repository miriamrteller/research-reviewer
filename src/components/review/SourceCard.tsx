// One source as an accordion item: number, title, evidence grade, badges and quote; opens to the passage.
import { Accordion } from '@base-ui/react/accordion'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import { Badge } from './Badge'

type BadgeItem = { group: string; label: string; icon: LucideIcon }

type SourceCardProps = {
  number: number
  title: string
  meta: string
  grade: BadgeItem
  badges: readonly BadgeItem[]
  quote: string
  passage: string
  lowered?: string
}

export function SourceCard({
  number,
  title,
  meta,
  grade,
  badges,
  quote,
  passage,
  lowered,
}: SourceCardProps) {
  return (
    <Accordion.Item className="grid gap-2 border-b border-outline-variant py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <Accordion.Header className="min-w-0 flex-1">
          <Accordion.Trigger className="group flex w-full items-start gap-2 rounded-sm text-left">
            <span className="type-label-medium text-primary">{number}</span>
            {/* A real space, so the button's name reads "1 Title", not "1Title". */}{' '}
            <span className="flex-1 type-title-small">{title}</span>
            <ChevronDown
              aria-hidden="true"
              className="size-5 shrink-0 transition-transform group-data-[panel-open]:rotate-180"
            />
          </Accordion.Trigger>
        </Accordion.Header>
        <Badge {...grade} />
      </div>
      <p className="type-body-small text-on-surface-variant">{meta}</p>
      <ul aria-label={`Checks for source ${number}`} className="flex flex-wrap gap-1">
        {badges.map((badge) => (
          <li key={badge.group}>
            <Badge {...badge} />
          </li>
        ))}
      </ul>
      {lowered && (
        <p className="type-body-small text-on-surface-variant">
          <strong className="text-on-surface">Lowered because:</strong> {lowered}
        </p>
      )}
      <blockquote className="border-l-2 border-outline pl-3 type-body-medium">“{quote}”</blockquote>
      <Accordion.Panel className="type-body-medium text-on-surface-variant">
        {passage}
      </Accordion.Panel>
    </Accordion.Item>
  )
}
