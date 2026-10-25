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
        '-mx-2 grid gap-3 rounded-md border-b border-outline-variant px-2 py-3 outline-offset-0 last:border-b-0',
        // Outline and tint (Miriam), not colour alone, mark the source of the claim in focus.
        lit && 'bg-secondary-container outline-2 outline-primary',
      )}
    >
      {/* Card body on the left; grade badge top right with the chevron centred below it (Miriam). */}
      <div className="flex gap-3">
        <div className="grid min-w-0 flex-1 gap-2">
          <h3 className="flex items-start gap-2">
            <span className="type-label-medium text-primary">{number}</span>{' '}
            <span className="flex-1 type-title-small">{title}</span>
          </h3>
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
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <Badge {...grade} />
          <Accordion.Header render={<div />} className="flex flex-1 items-center">
            <Accordion.Trigger
              ref={trigger}
              id={sourceTriggerId(number)}
              aria-label={`Full passage: ${title}`}
              className="group grid size-10 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
            >
              <ChevronDown
                aria-hidden="true"
                className="size-6 transition-transform group-data-[panel-open]:rotate-180"
              />
            </Accordion.Trigger>
          </Accordion.Header>
        </div>
      </div>
      <Accordion.Panel>
        <SourcePassage open={open} passage={passage} quote={quote} reference={reference} />
      </Accordion.Panel>
    </Accordion.Item>
  )
}
