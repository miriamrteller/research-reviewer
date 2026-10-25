// One source as an accordion item: number, title, evidence grade, badges and quote; opens to the passage.
import { Accordion } from '@base-ui/react/accordion'
import { ChevronDown } from 'lucide-react'
import type { Source } from '../../api/review/schema'
import { Badge } from './Badge'
import { badgeFor, rowGroups } from './badges'

type SourceCardProps = {
  source: Source
}

export function SourceCard({ source }: SourceCardProps) {
  const { number, title, design, publisher, year, citations, badges, lowered, quote, passage } =
    source
  return (
    <Accordion.Item className="group/item grid gap-2 border-b border-outline-variant py-3 last:border-b-0">
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
        <Badge {...badgeFor('evidenceStrength', badges)} />
      </div>
      <p className="type-body-small text-on-surface-variant">
        {design} · {publisher} · {year} · {citations} citations
      </p>
      <ul aria-label={`Checks for source ${number}`} className="flex flex-wrap gap-1">
        {rowGroups.map((group) => (
          <li key={group}>
            <Badge {...badgeFor(group, badges)} />
          </li>
        ))}
      </ul>
      {lowered && (
        <p className="type-body-small text-on-surface-variant">
          <strong className="text-on-surface">Lowered because:</strong> {lowered}
        </p>
      )}
      {/* The quote gives way to the full passage when the card opens, so the text shows once. */}
      <blockquote className="border-l-2 border-outline pl-3 type-body-medium group-data-[open]/item:hidden">
        “{quote}”
      </blockquote>
      <Accordion.Panel className="border-l-2 border-outline pl-3 type-body-medium">
        {passage}
      </Accordion.Panel>
    </Accordion.Item>
  )
}
