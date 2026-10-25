// The badge key's rows, in the order a reviewer reads a source card (ADR 001, research badge key).
import {
  BadgeCheck,
  Ban,
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
} from 'lucide-react'

export const badgeKeyRows = [
  {
    signal: 'Reference check',
    question: 'Is this source real and correctly cited?',
    values: [
      { label: 'Verified', icon: BadgeCheck },
      { label: 'Details differ', icon: TriangleAlert },
      { label: 'Not found', icon: FileX },
    ],
  },
  {
    signal: 'Publication status',
    question: 'Has this source been reviewed, and has it since been pulled?',
    values: [
      { label: 'Peer reviewed', icon: ShieldCheck },
      { label: 'Preprint', icon: FileClock },
      { label: 'Concern raised', icon: OctagonAlert },
      { label: 'Retracted', icon: Ban },
    ],
  },
  {
    signal: 'Claim support',
    question: 'Does the quoted passage say what the claim says?',
    values: [
      { label: 'Supported', icon: CircleCheck },
      { label: 'Partly supported', icon: CircleMinus },
      { label: 'Not supported', icon: CircleX },
    ],
  },
  {
    signal: 'Stance',
    question: 'Is this source for or against the claim, or does it only mention the topic?',
    values: [
      { label: 'Agrees', icon: ThumbsUp },
      { label: 'Disagrees', icon: ThumbsDown },
      { label: 'Neutral', icon: Minus },
    ],
  },
  {
    signal: 'Evidence strength',
    question: 'How much weight does this kind of study carry?',
    values: [
      { label: 'Strong', icon: SignalHigh },
      { label: 'Moderate', icon: SignalMedium },
      { label: 'Limited', icon: SignalLow },
      { label: 'Weak', icon: SignalZero },
    ],
  },
] as const
