// One claim as read: the cited words lit while their source or the claim is in focus, and a
// citation number per source that moves focus to that source's card.
import { cn } from '../../lib/cn'
import { segmentClaim } from '../../lib/highlight'

export type ClaimCitation = { number: number; words: string }

type ClaimTextProps = {
  id: string
  text: string
  citations: readonly ClaimCitation[]
  lit: readonly ClaimCitation[]
  onInspect: (id: string | null) => void
  onCite: (number: number) => void
  /** The type size that fits the claims box. */
  typeClass: string
}

export function ClaimText({
  id,
  text,
  citations,
  lit,
  onInspect,
  onCite,
  typeClass,
}: ClaimTextProps) {
  return (
    // Hover is extra; the citation buttons inside give keyboard users the same highlight.
    <div
      onMouseEnter={() => onInspect(id)}
      onMouseLeave={() => onInspect(null)}
      onFocus={() => onInspect(id)}
      onBlur={() => onInspect(null)}
      className={typeClass}
    >
      {/* Tint and underline on the cited words only, no box (Miriam): not colour alone. */}
      {segmentClaim(text, lit).map((run, i) =>
        run.lit ? (
          <span
            key={i}
            className="rounded-sm bg-secondary-container box-decoration-clone text-on-secondary-container underline decoration-primary decoration-2 underline-offset-4"
          >
            {run.text}
          </span>
        ) : (
          <span key={i}>{run.text}</span>
        ),
      )}
      {citations.map(({ number }) => (
        <sup key={number} className="ml-1">
          <button
            type="button"
            aria-label={`Go to source ${number}`}
            onClick={() => onCite(number)}
            // Bold, not outlined, while its words are lit (Miriam).
            className={cn(
              'rounded-sm px-0.5 type-label-small text-primary',
              lit.some((c) => c.number === number) && 'font-bold',
            )}
          >
            {number}
          </button>
        </sup>
      ))}
    </div>
  )
}
