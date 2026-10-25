// Icon, word and header tint for each review state.
import { CircleCheck, Clock, Lock, type LucideIcon } from 'lucide-react'
import type { ReviewState } from '../../api/review/schema'

type Look = { icon: LucideIcon; word: string; tint: string }

// Grey for waiting, red for sent back. No green token pair exists yet, so approved uses the
// primary container until the badge colour step adds one.
export const reviewLooks: Record<ReviewState['status'], Look> = {
  review: { icon: Clock, word: 'In review', tint: 'bg-surface-container-high text-on-surface' },
  approved: {
    icon: CircleCheck,
    word: 'Approved',
    tint: 'bg-primary-container text-on-primary-container',
  },
  revision_needed: {
    icon: Lock,
    word: 'Revision needed',
    tint: 'bg-error-container text-on-error-container',
  },
}
