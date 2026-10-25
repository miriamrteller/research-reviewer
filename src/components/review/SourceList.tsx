// The Sources column: a heading and the source cards as one accordion, scrolling inside its own box.
import { Accordion } from '@base-ui/react/accordion'
import type { ReactNode } from 'react'

type SourceListProps = {
  open: readonly number[]
  onOpenChange: (open: number[]) => void
  children: ReactNode
}

export function SourceList({ open, onOpenChange, children }: SourceListProps) {
  return (
    <section aria-labelledby="sources-heading" className="flex min-h-0 flex-col">
      <h2 id="sources-heading" className="sr-only">
        Sources
      </h2>
      <Accordion.Root
        multiple
        value={[...open]}
        onValueChange={(value: number[]) => onOpenChange(value)}
        className="relative flex min-h-0 flex-col rounded-lg border border-outline-variant px-4"
      >
        {children}
      </Accordion.Root>
    </section>
  )
}
