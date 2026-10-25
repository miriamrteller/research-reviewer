// The AI answer on its own paper: caveat, claims with citation numbers, and the decision buttons.
import { Sparkles } from 'lucide-react'
import { cn } from '../../lib/cn'
import { segmentClaim } from '../../lib/highlight'
import { Button } from '../Button'

type Citation = { number: number; words: string }
type Claim = { id: string; text: string; citations: readonly Citation[] }

type ClaimsPaperProps = {
  caveat: string
  claims: readonly Claim[]
  litFor: (claim: Claim) => Citation[]
  onInspect: (id: string | null) => void
  onCite: (number: number) => void
}

export function ClaimsPaper({ caveat, claims, litFor, onInspect, onCite }: ClaimsPaperProps) {
  return (
    <section
      aria-labelledby="claims-heading"
      className="flex min-h-0 flex-col rounded-lg bg-surface-container-low shadow-elevation-1"
    >
      <div className="px-6 pt-6">
        <h2 id="claims-heading" className="sr-only">
          AI answer
        </h2>
        <p className="inline-flex items-start gap-2 type-body-small text-on-surface-variant">
          <Sparkles aria-hidden="true" className="mt-px size-4 shrink-0" />
          {caveat}
        </p>
      </div>

      <div className="relative grid min-h-0 flex-1 content-start gap-6 overflow-y-auto px-6 py-4">
        {claims.map((claim) => (
          // Hover is extra; the citation buttons inside give keyboard users the same highlight.
          <div
            key={claim.id}
            onMouseEnter={() => onInspect(claim.id)}
            onMouseLeave={() => onInspect(null)}
            onFocus={() => onInspect(claim.id)}
            onBlur={() => onInspect(null)}
            className="type-headline-small"
          >
            {/* Tint and underline on the cited words only, no box (Miriam): not colour alone. */}
            {segmentClaim(claim.text, litFor(claim)).map((run, i) =>
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
            {claim.citations.map(({ number }) => (
              <sup key={number} className="ml-1">
                <button
                  type="button"
                  aria-label={`Go to source ${number}`}
                  onClick={() => onCite(number)}
                  // Bold, not outlined, while its words are lit (Miriam).
                  className={cn(
                    'rounded-sm px-0.5 type-label-small text-primary',
                    litFor(claim).some((c) => c.number === number) && 'font-bold',
                  )}
                >
                  {number}
                </button>
              </sup>
            ))}
          </div>
        ))}
      </div>

      {/* Drawn but inert: approve and revise are the write action in a later step. */}
      <div className="flex justify-end gap-2 border-t border-outline-variant px-6 py-4">
        <Button variant="outlined">Revise</Button>
        <Button>Approve</Button>
      </div>
    </section>
  )
}
