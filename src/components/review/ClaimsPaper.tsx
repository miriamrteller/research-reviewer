// The AI answer on its own paper: caveat with the Edit/Save toolbar top right, the claims (read,
// or a field each while editing), who edited what and when, a note on unsaved or unsent edits,
// and the decision buttons.
import { Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ClaimId, Stamp } from '../../api/review/schema'
import { cn } from '../../lib/cn'
import { formatAt } from '../../lib/formatStamp'
import { ClaimField } from './ClaimField'
import { ClaimText, type ClaimCitation } from './ClaimText'

export type ShownClaim = {
  id: ClaimId
  text: string
  citations: readonly ClaimCitation[]
  edit?: Stamp
}

type Editing = {
  drafts: Readonly<Record<string, string>>
  empty: ReadonlySet<ClaimId>
  onChange: (id: ClaimId, text: string) => void
}

type ClaimsPaperProps = {
  caveat: string
  claims: readonly ShownClaim[]
  litFor: (claim: ShownClaim) => ClaimCitation[]
  onInspect: (id: string | null) => void
  onCite: (number: number) => void
  /** Set while the claims are textareas. */
  editing?: Editing
  /** One line under the claims: unsaved edits, or saved edits not yet sent. */
  note?: string
  /** Edit or Save, and Discard while editing; top right. Nothing once decided. */
  toolbar: ReactNode
  /** Revise and Approve while in review and not editing; nothing otherwise. */
  actions: ReactNode
}

export function ClaimsPaper({
  caveat,
  claims,
  litFor,
  onInspect,
  onCite,
  editing,
  note,
  toolbar,
  actions,
}: ClaimsPaperProps) {
  return (
    <section
      aria-labelledby="claims-heading"
      className={cn(
        'flex min-h-0 flex-col rounded-lg shadow-elevation-1',
        // Edit mode is tinted (Miriam) so the whole paper reads as a form.
        editing ? 'bg-primary-container/25' : 'bg-surface-container-low',
      )}
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-4">
        <h2 id="claims-heading" className="sr-only">
          AI answer
        </h2>
        <p className="inline-flex items-start gap-2 pt-2 type-body-small text-on-surface-variant">
          <Sparkles aria-hidden="true" className="mt-px size-4 shrink-0" />
          AI-generated answer. {caveat}
        </p>
        {toolbar && <div className="flex shrink-0 gap-2">{toolbar}</div>}
      </div>

      <div className="relative grid min-h-0 flex-1 content-start gap-6 overflow-y-auto px-6 py-4">
        {claims.map((claim, index) =>
          editing ? (
            <ClaimField
              key={claim.id}
              id={claim.id}
              index={index}
              count={claims.length}
              value={editing.drafts[claim.id] ?? ''}
              sourceNumbers={claim.citations.map((c) => c.number)}
              empty={editing.empty.has(claim.id)}
              onChange={(text) => editing.onChange(claim.id, text)}
            />
          ) : (
            <div key={claim.id} className="grid gap-1">
              <ClaimText
                id={claim.id}
                text={claim.text}
                citations={claim.citations}
                lit={litFor(claim)}
                onInspect={onInspect}
                onCite={onCite}
              />
              {claim.edit && (
                <p className="type-label-medium text-on-surface-variant">
                  Edited by {claim.edit.by} ·{' '}
                  <time dateTime={claim.edit.at}>{formatAt(claim.edit.at)}</time>
                </p>
              )}
            </div>
          ),
        )}
        {note && <output className="type-body-small text-on-surface-variant">{note}</output>}
      </div>

      {actions && (
        <div className="flex flex-wrap justify-end gap-2 border-t border-outline-variant px-6 py-4">
          {actions}
        </div>
      )}
    </section>
  )
}
