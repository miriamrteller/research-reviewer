// Word and icon for every ADR 001 badge value, so each value in a group looks different.
import {
  Ban,
  BadgeCheck,
  CircleCheck,
  CircleMinus,
  CircleX,
  FileClock,
  FileX,
  Minus,
  OctagonAlert,
  ShieldCheck,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import type { SourceBadges } from '../../api/review/schema'

type BadgeLook = { label: string; icon: LucideIcon }
type Looks = { [K in keyof SourceBadges]: Record<SourceBadges[K], BadgeLook> }

export const badgeGroups = {
  referenceCheck: 'Reference check',
  publicationStatus: 'Publication status',
  claimSupport: 'Claim support',
  stance: 'Stance',
  evidenceStrength: 'Evidence strength',
} as const satisfies Record<keyof SourceBadges, string>

export const badgeLooks: Looks = {
  referenceCheck: {
    verified: { label: 'Verified', icon: BadgeCheck },
    mismatch: { label: 'Details differ', icon: TriangleAlert },
    not_found: { label: 'Not found', icon: FileX },
  },
  publicationStatus: {
    peer_reviewed: { label: 'Peer reviewed', icon: ShieldCheck },
    preprint: { label: 'Preprint', icon: FileClock },
    concern: { label: 'Concern raised', icon: OctagonAlert },
    retracted: { label: 'Retracted', icon: Ban },
  },
  claimSupport: {
    supported: { label: 'Supported', icon: CircleCheck },
    partial: { label: 'Partly supported', icon: CircleMinus },
    unsupported: { label: 'Not supported', icon: CircleX },
  },
  stance: {
    agrees: { label: 'Agrees', icon: ThumbsUp },
    disagrees: { label: 'Disagrees', icon: ThumbsDown },
    neutral: { label: 'Neutral', icon: Minus },
  },
  evidenceStrength: {
    strong: { label: 'Strong', icon: SignalHigh },
    moderate: { label: 'Moderate', icon: SignalMedium },
    limited: { label: 'Limited', icon: SignalLow },
    weak: { label: 'Weak', icon: SignalZero },
  },
}

/** The card's badge row, in ADR reading order; evidence strength sits beside the title. */
export const rowGroups = ['referenceCheck', 'publicationStatus', 'claimSupport', 'stance'] as const

export function badgeFor<K extends keyof SourceBadges>(group: K, badges: SourceBadges) {
  const look: BadgeLook = badgeLooks[group][badges[group]]
  return { group: badgeGroups[group], ...look }
}
