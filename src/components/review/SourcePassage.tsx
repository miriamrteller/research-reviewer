// The opened source: the whole document on its own scrolling paper, the quoted excerpt marked,
// and the reference code as a link to the original in a new tab. A source whose full text could
// not be found shows a skeleton where the text would be (Miriam).
import { ExternalLink } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { splitPassage } from '../../lib/highlight'
import { Skeleton } from '../Skeleton'
import { FullTextMissing } from './FullTextMissing'

const MISSING_LINES = [
  'w-full',
  'w-full',
  'w-11/12',
  'w-full',
  'w-2/3',
  'w-full',
  'w-full',
  'w-1/2',
]

type SourcePassageProps = {
  open: boolean
  passage?: string
  quote: string
  reference: { code: string; url: string }
}

export function SourcePassage({ open, passage, quote, reference }: SourcePassageProps) {
  const paper = useRef<HTMLDivElement>(null)
  const mark = useRef<HTMLElement>(null)
  const parts = passage === undefined ? undefined : splitPassage(passage, quote)

  // Scroll only the paper, not the page, so the marked excerpt is in view when the card opens.
  useEffect(() => {
    if (!open || !paper.current || !mark.current) return
    paper.current.scrollTop = mark.current.offsetTop - paper.current.offsetTop
  }, [open])

  return (
    <div
      ref={paper}
      className="h-full overflow-y-auto rounded-b-md bg-surface-container-lowest px-4 py-3"
    >
      <a
        href={reference.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 rounded-sm type-label-medium text-primary underline"
      >
        {reference.code} <span className="sr-only">(opens the original in a new tab)</span>
        <ExternalLink aria-hidden="true" className="size-4" />
      </a>
      {!parts ? (
        <div className="mt-2 grid gap-3">
          <FullTextMissing />
          <Skeleton typeClass="type-body-medium" lines={MISSING_LINES} />
        </div>
      ) : (
        <p className="mt-2 type-body-medium whitespace-pre-line text-on-surface">
          {parts.before}
          {parts.quote && (
            <>
              {/* Screen readers rarely announce <mark>, so the excerpt's ends are said in words. */}
              <span className="sr-only">Quoted excerpt starts. </span>
              <mark
                ref={mark}
                className="bg-transparent font-medium text-on-surface underline decoration-primary decoration-2 underline-offset-4"
              >
                {parts.quote}
              </mark>
              <span className="sr-only"> Quoted excerpt ends.</span>
            </>
          )}
          {parts.after}
        </p>
      )}
    </div>
  )
}
