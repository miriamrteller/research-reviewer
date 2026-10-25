// Icon, word and header tint for each review state.
import { CircleCheck, Clock, Lock, type LucideIcon } from 'lucide-react'
import type { ReviewState } from '../../api/review/schema'

type Look = { icon: LucideIcon; word: string; tint: string }

// Grey for waiting, green for approved, red for sent back. Green is kept for Approved only;
// good badges are blue.
export const reviewLooks: Record<ReviewState['status'], Look> = {
  review: { icon: Clock, word: 'In review', tint: 'bg-surface-container-high text-on-surface' },
  approved: {
    icon: CircleCheck,
    word: 'Approved',
    tint: 'bg-approved-container text-on-approved-container',
  },
  revision_needed: {
    icon: Lock,
    word: 'Revision needed',
    tint: 'bg-error-container text-on-error-container',
  },
}
