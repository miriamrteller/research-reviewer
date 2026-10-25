// The AI answer on its own paper: caveat, claims with citation numbers, and the decision buttons.
import { Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

type ClaimsPaperProps = {
  caveat: string
  claims: readonly { id: string; text: string; sourceNumbers: readonly number[] }[]
  /** Approve and Revise while in review; nothing once the answer is read-only. */
  actions: ReactNode
}

export function ClaimsPaper({ caveat, claims, actions }: ClaimsPaperProps) {
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
          AI-generated answer. {caveat}
        </p>
      </div>

      <div className="relative grid min-h-0 flex-1 content-start gap-6 overflow-y-auto px-6 py-4">
        {claims.map((claim) => (
          <p key={claim.id} className="type-headline-small">
            {claim.text}
            {claim.sourceNumbers.map((n) => (
              <sup key={n} className="ml-1 type-label-small text-primary">
                <span className="sr-only">source </span>
                {n}
              </sup>
            ))}
          </p>
        ))}
      </div>

      {actions && (
        <div className="flex justify-end gap-2 border-t border-outline-variant px-6 py-4">
          {actions}
        </div>
      )}
    </section>
  )
}
