// One claim as a borderless textarea that reads as part of the paragraph. The label is for screen
// readers, the citation numbers stay beside the text, and an empty claim is refused inline.
import type { ClaimId } from '../../api/review/schema'
import { cn } from '../../lib/cn'
import { Citations } from './Citations'

type ClaimFieldProps = {
  id: ClaimId
  index: number
  count: number
  value: string
  sourceNumbers: readonly number[]
  empty: boolean
  onChange: (text: string) => void
}

export function ClaimField({
  id,
  index,
  count,
  value,
  sourceNumbers,
  empty,
  onChange,
}: ClaimFieldProps) {
  const errorId = `${id}-error`
  return (
    <div
      data-focus-indicator="active-line"
      className={cn(
        'grid gap-1 border-b border-transparent focus-within:border-b-2 focus-within:border-primary',
        empty && 'border-error',
      )}
    >
      <label htmlFor={id} className="sr-only">
        Claim {index + 1} of {count}
      </label>
      <div className="relative">
        <textarea
          id={id}
          value={value}
          rows={1}
          aria-invalid={empty || undefined}
          aria-describedby={empty ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
          className="block w-full field-sizing-content resize-none bg-transparent pr-8 type-headline-small text-on-surface outline-none"
        />
        <span className="absolute top-0 right-0">
          <Citations numbers={sourceNumbers} />
        </span>
      </div>
      {empty && (
        <p id={errorId} className="type-body-small text-error">
          Write the claim or discard your changes. A claim cannot be empty.
        </p>
      )}
    </div>
  )
}
