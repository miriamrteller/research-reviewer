// Picks the largest claim type size that fits its box without scrolling (Miriam: claims keep
// their size and only step down when they would not fit). The box keeps its own scroll as the
// last resort, for text too long even at the smallest step.
import { useEffect, useState } from 'react'

const STEPS = ['type-headline-small', 'type-title-large', 'type-title-medium', 'type-body-large']
const LAST = STEPS.length - 1

/** `content` changes when the claims are saved, discarded or switch to fields. */
export function useFitText(content: string) {
  const [box, setBox] = useState<HTMLElement | null>(null)
  const [inner, setInner] = useState<HTMLElement | null>(null)
  const [fit, setFit] = useState({ content, step: 0 })

  // New content starts again from the largest size.
  if (fit.content !== content) setFit({ content, step: 0 })

  // The observer fires when the box resizes or the claims change height: step down one size while
  // they overflow, before the browser paints.
  useEffect(() => {
    if (!box || !inner || typeof ResizeObserver === 'undefined') return
    let width = box.clientWidth
    let height = box.clientHeight
    const observer = new ResizeObserver(() => {
      const resized = box.clientWidth !== width || box.clientHeight !== height
      width = box.clientWidth
      height = box.clientHeight
      const overflows = box.scrollHeight > box.clientHeight
      setFit((current) => {
        if (overflows) return current.step < LAST ? { ...current, step: current.step + 1 } : current
        // A resized box that fits may now fit a larger size; if not, the claims grow and overflow.
        return resized ? { ...current, step: 0 } : current
      })
    })
    observer.observe(box)
    observer.observe(inner)
    return () => observer.disconnect()
  }, [box, inner])

  const step = fit.content === content ? fit.step : 0
  return { setBox, setInner, typeClass: STEPS[step] ?? STEPS[0] }
}
