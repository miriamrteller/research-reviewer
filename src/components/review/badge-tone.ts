// Which colour each badge value gets (ADR 001). Green = good, amber = needs attention,
// orange = limited, red = bad, neutral = outline only. Classes are token utilities only.

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
  positive: 'border-transparent bg-positive-container text-on-positive-container',
  caution: 'border-transparent bg-caution-container text-on-caution-container',
  limited: 'border-transparent bg-limited-container text-on-limited-container',
  negative: 'border-transparent bg-error-container text-on-error-container',
  neutral: 'border-outline-variant text-on-surface-variant',
}

export function badgeTone(label: string): BadgeTone {
  return badgeToneByLabel[label] ?? 'neutral'
}
