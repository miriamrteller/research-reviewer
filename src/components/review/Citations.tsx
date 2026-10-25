// The citation numbers after a claim, read as "source 1 source 2".
type CitationsProps = { numbers: readonly number[] }

export function Citations({ numbers }: CitationsProps) {
  return numbers.map((n) => (
    <sup key={n} className="ml-1 type-label-small text-primary">
      <span className="sr-only">source </span>
      {n}
    </sup>
  ))
}
