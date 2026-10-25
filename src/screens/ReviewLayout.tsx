// Static review layout from Miriam's sketch (docs/research/my-layout-sketch.jpg). Hard-coded,
// fictional sample content; no data fetching and no writes. Owns the inspect state: which claim or
// source is in focus, and which sources are open. The live screen replaces the sample data.
import {
  BadgeCheck,
  CircleCheck,
  CircleMinus,
  FileClock,
  Minus,
  ShieldCheck,
  SignalLow,
  SignalMedium,
  ThumbsUp,
  TriangleAlert,
} from 'lucide-react'
import { useState } from 'react'
import { ClaimsPaper } from '../components/review/ClaimsPaper'
import { FeedbackFab } from '../components/review/FeedbackFab'
import { QuestionHeader } from '../components/review/QuestionHeader'
import { SourceCard } from '../components/review/SourceCard'
import { SourceList } from '../components/review/SourceList'
import { isClaimLit, isSourceLit, sourceTriggerId, type Focused } from '../lib/highlight'

const question = 'Does a short evening walk help older adults fall asleep faster?'

const caveat =
  'AI-generated answer. The badges are the AI’s own checks and can be wrong. Read each source before you decide.'

const claims = [
  {
    id: 'claim-1',
    text: 'A 20-minute evening walk shortened the time adults over 65 took to fall asleep by about 12 minutes.',
    sourceNumbers: [1],
  },
  {
    id: 'claim-2',
    text: 'The benefit was smaller for people who already walked every day, and it faded after eight weeks.',
    sourceNumbers: [2],
  },
  {
    id: 'claim-3',
    text: 'Walking in daylight, rather than in the evening, may matter more for when people fall asleep.',
    sourceNumbers: [3],
  },
] as const

const sources = [
  {
    number: 1,
    reference: { code: 'SRC-01', url: 'https://sources.example.org/src-01' },
    title: 'Evening walking and sleep onset after 65: a trial',
    meta: 'Controlled study · Meridale Journal of Sleep Health · 2024 · 41 citations',
    grade: { group: 'Evidence strength', label: 'Moderate', icon: SignalMedium },
    badges: [
      { group: 'Reference check', label: 'Verified', icon: BadgeCheck },
      { group: 'Publication status', label: 'Peer reviewed', icon: ShieldCheck },
      { group: 'Claim support', label: 'Supported', icon: CircleCheck },
      { group: 'Stance', label: 'Agrees', icon: ThumbsUp },
    ],
    quote: 'Sleep onset latency fell by a mean of 12 minutes in the walking group.',
    passage:
      'Participants walked for 20 minutes between 6 pm and 8 pm on at least five days a week. Sleep onset latency fell by a mean of 12 minutes in the walking group, against 3 minutes in the control group, over the six-week trial.',
  },
  {
    number: 2,
    reference: { code: 'SRC-02', url: 'https://sources.example.org/src-02' },
    title: 'Habitual activity and the fading benefit of walking programmes',
    meta: 'Observational study · Preprint server Openleaf · 2025 · 6 citations',
    grade: { group: 'Evidence strength', label: 'Limited', icon: SignalLow },
    badges: [
      { group: 'Reference check', label: 'Details differ', icon: TriangleAlert },
      { group: 'Publication status', label: 'Preprint', icon: FileClock },
      { group: 'Claim support', label: 'Partly supported', icon: CircleMinus },
      { group: 'Stance', label: 'Neutral', icon: Minus },
    ],
    lowered: 'it measured self-reported rest, not sleep.',
    quote: 'Gains were smaller among habitual walkers and gone by week 10.',
    passage:
      'We followed 212 adults through a community walking programme. Gains were smaller among habitual walkers and gone by week 10. The study did not measure sleep directly; outcomes were self-reported rest quality.',
  },
  {
    number: 3,
    reference: { code: 'SRC-03', url: 'https://sources.example.org/src-03' },
    title: 'Light exposure timing and circadian phase in later life: a review',
    meta: 'Systematic review · Hollin Review of Ageing · 2023 · 128 citations',
    grade: { group: 'Evidence strength', label: 'Moderate', icon: SignalMedium },
    badges: [
      { group: 'Reference check', label: 'Verified', icon: BadgeCheck },
      { group: 'Publication status', label: 'Peer reviewed', icon: ShieldCheck },
      { group: 'Claim support', label: 'Supported', icon: CircleCheck },
      { group: 'Stance', label: 'Agrees', icon: ThumbsUp },
    ],
    lowered: 'half of its 34 studies were small and unblinded.',
    quote: 'Morning daylight shifted sleep timing more than activity did.',
    passage:
      'Across 34 studies, morning daylight shifted sleep timing more than activity did. Evening exercise showed small effects on sleep onset that were not consistent between studies.',
  },
] as const

export function ReviewLayout() {
  const [focused, setFocused] = useState<Focused>(null)
  const [open, setOpen] = useState<number[]>([])

  return (
    // Sources show in full for now (Miriam); their inner scroll comes in the next step. The health
    // toast and Feedback FAB may overlap the page; html scroll-padding keeps focus clear of them.
    <main className="mx-auto flex w-full flex-col gap-8 px-4 py-6 sm:p-8 md:px-12">
      <QuestionHeader question={question} status="In review" />
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <ClaimsPaper
          caveat={caveat}
          claims={claims}
          isLit={(claim) => isClaimLit(claim, focused)}
          onInspect={(id) => setFocused(id === null ? null : { kind: 'claim', id })}
          onCite={(n) => document.getElementById(sourceTriggerId(n))?.focus()}
        />
        <SourceList open={open} onOpenChange={setOpen}>
          {sources.map((source) => (
            <SourceCard
              key={source.number}
              {...source}
              open={open.includes(source.number)}
              lit={isSourceLit(source.number, claims, focused)}
              onClose={() => setOpen(open.filter((n) => n !== source.number))}
              onInspect={(n) => setFocused(n === null ? null : { kind: 'source', number: n })}
            />
          ))}
        </SourceList>
      </div>
      <FeedbackFab />
    </main>
  )
}
