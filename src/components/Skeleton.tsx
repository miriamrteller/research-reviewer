// A placeholder for words still coming from the API: one bar per line, the height of the text it
// stands in for, so the layout does not jump when the words arrive. Decorative, so hidden from
// screen readers; the busy status says what is happening.
import { cn } from '../lib/cn'

type SkeletonProps = {
  /** The type-* class of the text it stands in for, so each bar is one line tall. */
  typeClass: string
  /** Bar widths, one per line, as Tailwind width classes. */
  lines?: readonly string[]
  className?: string
}

export function Skeleton({ typeClass, lines = ['w-full'], className }: SkeletonProps) {
  return (
    <span aria-hidden="true" className={cn('grid', typeClass, className)}>
      {lines.map((width, i) => (
        <span key={i} className="relative block">
          {/* The no-break space gives the line its text height; the bar sits inside it. */}
          &nbsp;
          <span
            className={cn(
              'absolute top-1/2 left-0 h-[0.75em] -translate-y-1/2 rounded-sm bg-on-surface/12 motion-safe:animate-pulse',
              width,
            )}
          />
        </span>
      ))}
    </span>
  )
}
