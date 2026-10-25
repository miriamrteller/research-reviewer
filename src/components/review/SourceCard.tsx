// One source as an accordion item: number, title, evidence grade, badges and quote; the chevron
// opens it to the whole passage. While any source is open, every card shrinks to one line (title
// and badges) and the open one shows its paper underneath (Miriam). Escape closes and returns focus.
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
  compact: boolean
  lit: boolean
  onClose: () => void
  onInspect: (number: number | null) => void
}

export function SourceCard(props: SourceCardProps) {
  const { number, title, meta, grade, badges, quote, lowered, open, compact, lit } = props
  const trigger = useRef<HTMLButtonElement>(null)

  const heading = (
    <h3 className="flex min-w-0 items-start gap-2">
      <span className="type-label-medium text-primary">{number}</span>{' '}
      <span className={cn('flex-1 type-title-small', compact && 'truncate')}>{title}</span>
    </h3>
  )
  const checks = (
    <ul
      aria-label={`Checks for source ${number}`}
      className={cn('flex gap-1', compact ? 'flex-nowrap' : 'flex-wrap')}
    >
      {badges.map((badge) => (
        <li key={badge.group}>
          <Badge {...badge} />
        </li>
      ))}
    </ul>
  )
  const chevron = (
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
  )

  return (
    <Accordion.Item
      value={number}
      onMouseEnter={() => props.onInspect(number)}
      onMouseLeave={() => props.onInspect(null)}
      onFocus={() => props.onInspect(number)}
      onBlur={() => props.onInspect(null)}
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !open) return
        props.onClose()
        trigger.current?.focus()
      }}
      className={cn(
        '-mx-2 grid gap-3 rounded-md border-b border-outline-variant px-2 outline-offset-0 last:border-b-0',
        compact ? 'py-1' : 'py-3',
        // Outline and tint (Miriam), not colour alone, mark the source of the claim in focus.
        lit && 'bg-secondary-container outline-2 outline-primary',
      )}
    >
      {/* One tree for both layouts, so the chevron keeps focus when the cards shrink. Full: body
          left, grade top right with the chevron centred below it. Compact: all on one line. */}
      <div className={cn('flex gap-3', compact && 'items-center gap-2')}>
        <div className={cn('min-w-0 flex-1', compact ? 'grid gap-1' : 'grid gap-2')}>
          {heading}
          {!compact && <p className="type-body-small text-on-surface-variant">{meta}</p>}
          {checks}
          {!compact && lowered && (
            <p className="type-body-small text-on-surface-variant">
              <strong className="text-on-surface">Lowered because:</strong> {lowered}
            </p>
          )}
          {!compact && (
            <blockquote className="border-l-2 border-outline pl-3 type-body-medium">
              “{quote}”
            </blockquote>
          )}
        </div>
        <div className={cn('flex shrink-0 items-end', compact ? 'items-center gap-1' : 'flex-col')}>
          <Badge {...grade} />
          {chevron}
        </div>
      </div>
      <Accordion.Panel>
        <SourcePassage
          open={open}
          passage={props.passage}
          quote={quote}
          reference={props.reference}
        />
      </Accordion.Panel>
    </Accordion.Item>
  )
}
