// The claims paper and source cards while the review loads, with skeleton bars only where the
// API's words will go (Miriam). The header shows its own skeleton (QuestionHeader).
import { Sparkles } from 'lucide-react'
import { Skeleton } from '../Skeleton'
import { cn } from '../../lib/cn'

const CLAIMS = [
  ['w-full', 'w-full', 'w-1/4'],
  ['w-full', 'w-1/3'],
  ['w-full', 'w-full', 'w-3/4'],
]
const BADGES = ['w-20', 'w-28', 'w-24', 'w-20']

export function ReviewSkeleton() {
  return (
    <>
      <output aria-busy="true" className="sr-only">
        Loading the review…
      </output>
      <div aria-hidden="true" className="grid gap-6 md:min-h-0 md:flex-1 md:grid-cols-2 md:gap-8">
        <div className="flex min-h-0 flex-col rounded-lg bg-surface-container-low shadow-elevation-1">
          <div className="flex items-start gap-2 px-6 pt-6 text-on-surface-variant">
            <Sparkles className="mt-px size-4 shrink-0" />
            <Skeleton
              typeClass="type-body-small"
              lines={['w-full', 'w-full', 'w-1/2']}
              className="flex-1"
            />
          </div>
          <div className="grid content-start gap-6 px-6 py-4">
            {CLAIMS.map((lines, i) => (
              <Skeleton key={i} typeClass="type-headline-small" lines={lines} />
            ))}
          </div>
        </div>
        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-outline-variant px-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="grid gap-2 border-b border-outline-variant py-3 last:border-b-0"
            >
              <div className="flex items-start gap-2">
                <span className="type-label-medium text-primary">{n}</span>
                <Skeleton typeClass="type-title-small" lines={['w-3/5']} className="flex-1" />
              </div>
              <Skeleton typeClass="type-body-small" lines={['w-4/5']} />
              <div className="flex flex-wrap gap-1">
                {BADGES.map((width, i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-6 rounded-sm bg-on-surface/12 motion-safe:animate-pulse',
                      width,
                    )}
                  />
                ))}
              </div>
              <div className="border-l-2 border-outline pl-3">
                <Skeleton typeClass="type-body-medium" lines={['w-full', 'w-2/3']} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
