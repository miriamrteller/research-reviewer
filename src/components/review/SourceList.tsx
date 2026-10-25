// The Sources column: a heading and the source cards as one accordion, scrolling inside its own box.
import { Accordion } from '@base-ui/react/accordion'
import type { ReactNode } from 'react'

type SourceListProps = {
  children: ReactNode
}

export function SourceList({ children }: SourceListProps) {
  return (
    <section aria-labelledby="sources-heading" className="flex min-h-0 flex-col">
      <h2 id="sources-heading" className="sr-only">
        Sources
      </h2>
      <Accordion.Root
        multiple
        className="relative min-h-0 overflow-y-auto rounded-lg border border-outline-variant px-4"
      >
        {children}
      </Accordion.Root>
    </section>
  )
}
