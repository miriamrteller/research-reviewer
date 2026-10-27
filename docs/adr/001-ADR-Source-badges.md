# ADR 001: Five badges on every source card

Status: Proposed · Date: 2026-10-25

## Context

The reviewer checks an AI answer made of claims, each backed by one or more sources shown as cards.
Before approving, they need to see at a glance whether each source can be trusted, without opening
it. Live research tools fail most often on citations that do not exist or quotes that do not say
what the claim says, so those checks must be visible on the card. A card with too many badges
cannot be read in a timebox demo or on a laptop screen. The badge rules in ADR 000 (icon, colour
and word together) apply as they are.

Constraints: one reviewer, a laptop window, a mock API that returns every signal as fixture data,
and a two-hour build. The research behind this choice is in
[uncertainty-signals.md](../research/uncertainty-signals.md), sections "Ranking by usefulness to a
reviewer" and "Recommended final set".

## Decision

Each source card shows five badge groups, one value each, in the order a reviewer reads a card.

- Reference check: Verified (badge-check, blue) · Details differ (alert-triangle, amber) · Not
  found (file-x, red). Schema values `verified` | `mismatch` | `not_found`.
- Publication status: Peer reviewed (shield-check, blue) · Preprint (file-clock, neutral) ·
  Concern raised (alert-octagon, amber) · Retracted (ban, red). Schema values `peer_reviewed` |
  `preprint` | `concern` | `retracted`. A correction is a line of text on the card, not a badge
  value.
- Claim support: Supported (check-circle, blue) · Partly supported (minus-circle, amber) · Not
  supported (x-circle, red). Schema values `supported` | `partial` | `unsupported`.
- Stance: Agrees (thumbs-up, blue) · Disagrees (thumbs-down, red) · Neutral (minus, neutral).
  Schema values `agrees` | `disagrees` | `neutral`.
- Evidence strength: Strong (signal-high, blue) · Moderate (signal-medium, amber) · Limited
  (signal-low, pink) · Weak (signal-zero, grey), mapped from study design: review or
  meta-analysis, controlled study, observational or single dataset, opinion or unspecified. The
  design word shows as text beside the badge.
- Plain text, not badges: publication year and citation count in the card's meta line.
- Not shown on cards: model confidence and source prestige.
- Badge key: one table listing the five groups in the order above.
- Good values are blue, not green, so green keeps one meaning: Approved; Limited is pink so it stands apart from amber Moderate (Miriam, 2026-10-25).

## Alternatives considered

- Claim support only. Rejected because a fabricated or retracted source looks fine on that badge
  alone.
- All nine signals from the research. Rejected because model confidence is poorly calibrated,
  prestige is a weak proxy, and nine groups do not fit a card.
- Model confidence as a badge. Rejected because reviewers over-trust it and its values cluster at
  80 to 100%.

## Consequences

- What becomes easier or safer: the reviewer sees "is it real", "has it been pulled" and "does the
  quote match" before reading any source.
- What the codebase now guarantees: each group is a Zod enum on the source schema, and every value
  has its own icon, colour and word.
- What becomes harder, or what the prototype mocks: every signal is fixture data; a real system
  needs a reference lookup, a retraction feed and an entailment check. Blue, amber, pink and grey
  need token pairs with contrast tests. Agreement between sources, derived per claim from stance,
  is a sub-flow and is cut first.
- What a reviewer should watch for: two values in one group that look alike, and the same colour
  meaning different things across groups (amber always means "needs attention").
