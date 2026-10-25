// Which colour each badge value gets (ADR 001). Blue = good (green is kept for Approved), amber = needs attention,
// pink = limited, red = bad, neutral = outline only. Classes are token utilities only.

export type BadgeTone = 'positive' | 'caution' | 'limited' | 'negative' | 'neutral'

export const badgeToneByLabel: Readonly<Record<string, BadgeTone>> = {
  // Reference check
  Verified: 'positive',
  'Details differ': 'caution',
  'Not found': 'negative',
  // Publication status
  'Peer reviewed': 'positive',
  Preprint: 'neutral',
  'Concern raised': 'caution',
  Retracted: 'negative',
  // Claim support
  Supported: 'positive',
  'Partly supported': 'caution',
  'Not supported': 'negative',
  // Stance
  Agrees: 'positive',
  Disagrees: 'negative',
  Neutral: 'neutral',
  // Evidence strength
  Strong: 'positive',
  Moderate: 'caution',
  Limited: 'limited',
  Weak: 'neutral',
}

export const badgeToneClass: Readonly<Record<BadgeTone, string>> = {
  positive: 'border-transparent bg-positive-container text-positive',
  caution: 'border-transparent bg-caution-container text-caution',
  limited: 'border-transparent bg-limited-container text-limited',
  negative: 'border-transparent bg-error-container text-error',
  neutral: 'border-outline-variant text-on-surface-variant',
}

export function badgeTone(label: string): BadgeTone {
  return badgeToneByLabel[label] ?? 'neutral'
}
