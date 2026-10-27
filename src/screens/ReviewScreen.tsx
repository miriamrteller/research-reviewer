// The live review screen: loads the review document, shows loading and error as query states,
// owns the claim edit draft and which decision dialog is open. Approve and Revise are one write
// each, never retried, and carry the saved edits with them.
import { Pencil, Save } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useApproveReview, useReviewDocument, useReviseReview } from '../api/review/review'
import type { ClaimEdit, ReviewDocument } from '../api/review/schema'
import { Button } from '../components/Button'
import { ApproveDialog } from '../components/review/ApproveDialog'
import { ClaimsPaper } from '../components/review/ClaimsPaper'
import { QuestionHeader } from '../components/review/QuestionHeader'
import { ReviewSkeleton } from '../components/review/ReviewSkeleton'
import { ReviseDialog } from '../components/review/ReviseDialog'
import { SourceCard } from '../components/review/SourceCard'
import { SourceList } from '../components/review/SourceList'
import { describeError } from '../lib/describeError'
import { isSourceLit, litCitations, sourceTriggerId, type Focused } from '../lib/highlight'
import { SendFeedback } from './SendFeedback'
import { useClaimEdits } from './useClaimEdits'

// After a write the decision buttons are gone, so focus moves to the new status; after Save or
// Discard the textareas are gone, so focus returns to Edit. Never <body>.
function focusId(id: string) {
  requestAnimationFrame(() => document.getElementById(id)?.focus())
}

const UNSAVED = 'Save or discard your changes to approve or send for revision.'
const UNSENT = 'Edited text is kept on this page only until you approve or send for revision.'

export function ReviewScreen() {
  const document = useReviewDocument()
  const approve = useApproveReview()
  const revise = useReviseReview()
  const [openDialog, setOpenDialog] = useState<'approve' | 'revise' | null>(null)

  function toggle(dialog: 'approve' | 'revise', open: boolean) {
    if (open) {
      approve.reset()
      revise.reset()
    }
    setOpenDialog(open ? dialog : null)
  }

  const done = {
    onSuccess: () => {
      setOpenDialog(null)
      focusId('review-status')
    },
  }

  return (
    // Sources show in full for now (Miriam); their inner scroll comes in the next step. The health
    // toast and Feedback FAB may overlap the page; html scroll-padding keeps focus clear of them.
    // A margin all round and a max width keep the middle of the page easy to see (Miriam).
    <main className="flex w-full flex-col px-4 py-6 sm:p-8 md:h-dvh md:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 md:min-h-0 md:flex-1">
        {/* One header for loading and loaded, so it is not remounted when the words arrive. */}
        {!document.isError && (
          <QuestionHeader
            review={
              document.data && { question: document.data.question, state: document.data.review }
            }
          />
        )}
        {document.isPending ? (
          <ReviewSkeleton />
        ) : document.isError ? (
          <div
            role="alert"
            className="grid justify-items-start gap-3 rounded-md bg-error-container p-4 text-on-error-container"
          >
            <h1 id="page-title" tabIndex={-1} className="type-title-medium">
              The review could not be loaded
            </h1>
            <p className="type-body-medium">{describeError(document.error)} Try again.</p>
            <Button variant="tonal" onClick={() => void document.refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <ReviewBody
            doc={document.data}
            decisions={(edits) => (
              <>
                <ReviseDialog
                  open={openDialog === 'revise'}
                  onOpenChange={(open) => toggle('revise', open)}
                  onRevise={(reason) => revise.mutate({ reason, ...edits }, done)}
                  pending={revise.isPending}
                  error={revise.isError ? describeError(revise.error) : null}
                />
                <ApproveDialog
                  open={openDialog === 'approve'}
                  onOpenChange={(open) => toggle('approve', open)}
                  onApprove={(note) =>
                    approve.mutate({ ...(note ? { note } : {}), ...edits }, done)
                  }
                  pending={approve.isPending}
                  error={approve.isError ? describeError(approve.error) : null}
                />
              </>
            )}
          />
        )}
      </div>
      <SendFeedback />
    </main>
  )
}

type ReviewBodyProps = {
  doc: ReviewDocument
  /** The Revise and Approve dialogs, given the saved edits to send with the decision. */
  decisions: (edits: { claims?: ClaimEdit[] }) => ReactNode
}

// Owns the inspect state (which claim or source is in focus, which sources are open) and the
// claim edit draft.
function ReviewBody({ doc, decisions }: ReviewBodyProps) {
  const [focused, setFocused] = useState<Focused>(null)
  const [open, setOpen] = useState<number[]>([])
  const edit = useClaimEdits(doc.claims)
  const numberOf = new Map(doc.sources.map((source) => [source.id, source.number]))
  const claims = edit.shown.map((claim) => ({
    id: claim.id,
    text: claim.text,
    edit: claim.edit,
    citations: claim.citations.flatMap(({ sourceId, words }) => {
      const number = numberOf.get(sourceId)
      return number === undefined ? [] : [{ number, words }]
    }),
  }))
  const inReview = doc.review.status === 'review'

  function startEditing() {
    edit.start()
    focusId(doc.claims[0]?.id ?? '')
  }
  function finishEditing(keep: boolean) {
    const closed = keep ? edit.save() : edit.discard()
    if (closed) focusId('edit-claims')
  }

  return (
    <>
      <div className="grid gap-6 md:min-h-0 md:flex-1 md:grid-cols-2 md:gap-8">
        <ClaimsPaper
          caveat={doc.caveat}
          claims={claims}
          litFor={(claim) => litCitations(claim, focused)}
          onInspect={(id) => setFocused(id === null ? null : { kind: 'claim', id })}
          onCite={(n) => document.getElementById(sourceTriggerId(n))?.focus()}
          editing={
            edit.editing
              ? { drafts: edit.drafts, empty: edit.empty, onChange: edit.change }
              : undefined
          }
          note={
            !inReview
              ? undefined
              : edit.editing
                ? UNSAVED
                : edit.edits.length > 0
                  ? UNSENT
                  : undefined
          }
          toolbar={
            inReview && (
              <>
                {edit.editing && (
                  <Button variant="text" onClick={() => finishEditing(false)}>
                    Discard
                  </Button>
                )}
                <Button
                  id="edit-claims"
                  variant="tonal"
                  onClick={() => (edit.editing ? finishEditing(true) : startEditing())}
                >
                  {edit.editing ? (
                    <Save aria-hidden="true" className="size-4" />
                  ) : (
                    <Pencil aria-hidden="true" className="size-4" />
                  )}
                  {edit.editing ? 'Save' : 'Edit'}
                </Button>
              </>
            )
          }
          actions={
            inReview &&
            !edit.editing &&
            decisions(edit.edits.length > 0 ? { claims: edit.edits } : {})
          }
        />
        <SourceList open={open} onOpenChange={setOpen}>
          {doc.sources.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              open={open.includes(source.number)}
              compact={open.length > 0}
              lit={isSourceLit(source.number, claims, focused)}
              onClose={() => setOpen(open.filter((n) => n !== source.number))}
              onInspect={(n) => setFocused(n === null ? null : { kind: 'source', number: n })}
            />
          ))}
        </SourceList>
      </div>
    </>
  )
}
