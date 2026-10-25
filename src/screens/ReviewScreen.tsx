// The live review screen: loads the review document, shows loading and error as query states,
// and owns which decision dialog is open. Approve and Revise are one write each, never retried.
import { useState, type ReactNode } from 'react'
import { useApproveReview, useReviewDocument, useReviseReview } from '../api/review/review'
import type { ReviewDocument } from '../api/review/schema'
import { Button } from '../components/Button'
import { ApproveDialog } from '../components/review/ApproveDialog'
import { ClaimsPaper } from '../components/review/ClaimsPaper'
import { QuestionHeader } from '../components/review/QuestionHeader'
import { ReviseDialog } from '../components/review/ReviseDialog'
import { SourceCard } from '../components/review/SourceCard'
import { SourceList } from '../components/review/SourceList'
import { describeError } from '../lib/describeError'
import { isSourceLit, litCitations, sourceTriggerId, type Focused } from '../lib/highlight'
import { SendFeedback } from './SendFeedback'

// The decision buttons are gone after a write, so focus moves to the new status instead of <body>.
function focusStatus() {
  requestAnimationFrame(() => document.getElementById('review-status')?.focus())
}

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
      focusStatus()
    },
  }

  return (
    // Sources show in full for now (Miriam); their inner scroll comes in the next step. The health
    // toast and Feedback FAB may overlap the page; html scroll-padding keeps focus clear of them.
    <main className="mx-auto flex w-full flex-col gap-8 px-4 py-6 sm:p-8 md:h-dvh md:px-12">
      {document.isPending ? (
        <output aria-busy="true" className="type-body-large text-on-surface-variant">
          Loading the review…
        </output>
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
          actions={
            document.data.review.status === 'review' && (
              <>
                <ReviseDialog
                  open={openDialog === 'revise'}
                  onOpenChange={(open) => toggle('revise', open)}
                  onRevise={(reason) => revise.mutate({ reason }, done)}
                  pending={revise.isPending}
                  error={revise.isError ? describeError(revise.error) : null}
                />
                <ApproveDialog
                  open={openDialog === 'approve'}
                  onOpenChange={(open) => toggle('approve', open)}
                  onApprove={(note) => approve.mutate(note ? { note } : {}, done)}
                  pending={approve.isPending}
                  error={approve.isError ? describeError(approve.error) : null}
                />
              </>
            )
          }
        />
      )}
      <SendFeedback />
    </main>
  )
}

type ReviewBodyProps = {
  doc: ReviewDocument
  actions: ReactNode
}

// Owns the inspect state: which claim or source is in focus, and which sources are open.
function ReviewBody({ doc, actions }: ReviewBodyProps) {
  const [focused, setFocused] = useState<Focused>(null)
  const [open, setOpen] = useState<number[]>([])
  const numberOf = new Map(doc.sources.map((source) => [source.id, source.number]))
  const claims = doc.claims.map((claim) => ({
    id: claim.id,
    text: claim.text,
    citations: claim.citations.flatMap(({ sourceId, words }) => {
      const number = numberOf.get(sourceId)
      return number === undefined ? [] : [{ number, words }]
    }),
  }))
  return (
    <>
      <QuestionHeader question={doc.question} state={doc.review} />
      <div className="grid gap-6 md:min-h-0 md:flex-1 md:grid-cols-2 md:gap-8">
        <ClaimsPaper
          caveat={doc.caveat}
          claims={claims}
          actions={actions}
          litFor={(claim) => litCitations(claim, focused)}
          onInspect={(id) => setFocused(id === null ? null : { kind: 'claim', id })}
          onCite={(n) => document.getElementById(sourceTriggerId(n))?.focus()}
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
