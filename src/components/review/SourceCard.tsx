// One source as an accordion item: number, title, evidence grade, badges and quote; the chevron
// opens it to the whole passage. Escape closes it and puts focus back on the chevron.
import { Accordion } from '@base-ui/react/accordion'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import { useRef } from 'react'
import { cn } from '../../lib/cn'
import { sourceTriggerId } from '../../lib/highlight'
import { Badge } from './Badge'
import { SourcePassage } from './SourcePassage'

type BadgeItem = { group: string; label: string; icon: LucideIcon }

type SourceCardProps = {
  number: number
  title: string
  meta: string
  grade: BadgeItem
  badges: readonly BadgeItem[]
  quote: string
  passage: string
  reference: { code: string; url: string }
  lowered?: string
  open: boolean
  lit: boolean
  onClose: () => void
  onInspect: (number: number | null) => void
}

export function SourceCard({
  number,
  title,
  meta,
  grade,
  badges,
  quote,
  passage,
  reference,
  lowered,
  open,
  lit,
  onClose,
  onInspect,
}: SourceCardProps) {
  const trigger = useRef<HTMLButtonElement>(null)
  return (
    <Accordion.Item
      value={number}
      onMouseEnter={() => onInspect(number)}
      onMouseLeave={() => onInspect(null)}
      onFocus={() => onInspect(number)}
      onBlur={() => onInspect(null)}
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !open) return
        onClose()
        trigger.current?.focus()
      }}
      className={cn(
        '-mx-2 grid gap-2 rounded-md border-b border-outline-variant px-2 py-3 outline-offset-0 last:border-b-0',
        // Outline, not colour alone, marks the source of the claim in focus.
        lit && 'outline-2 outline-primary',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Accordion.Header className="min-w-0 flex-1">
          <Accordion.Trigger
            ref={trigger}
            id={sourceTriggerId(number)}
            className="group flex w-full items-start gap-2 rounded-sm text-left"
          >
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
      {/* Open, the quote is marked inside the passage, so it is shown once. */}
      {!open && (
        <blockquote className="border-l-2 border-outline pl-3 type-body-medium">
          “{quote}”
        </blockquote>
      )}
      <Accordion.Panel>
        <SourcePassage open={open} passage={passage} quote={quote} reference={reference} />
      </Accordion.Panel>
    </Accordion.Item>
  )
}
