# ADR 002: Sources in one panel beside the claims with always-visible trust signals

Status: Accepted · Date: 2026-10-22 · Last revised: 2026-10-25

## Context

The workspace exists so a human reviewer can check, quickly and honestly, that each AI Claim rests on a reliable source. The reviewer must see, for every claim, whether its source is real, whether it says what the claim says, and how strong the evidence is, without hunting for it.

Constraint: trust signals are never behind a click or hover. The design must meet WCAG 2.2 AA for keyboard, touch and screen reader users.

## Decision

Show every source as a bar in one Sources panel on the right of the review text. The panel replaces both the left margin cards and the separate side panel, which repeated each other.

- Bars in a panel: each source is its own bar, with its own border and tint, like the margin cards gave, numbered to match the citation numbers in the claims. Inside each bar: the title with type and year, and the claim's certainty chip at the far right of that line; then the reference check, support and stance badges; then, when the certainty is not high, "Why lowered:" and the reason in italic grey; then the quotes, set off by a rule on their left. A claim with two sources shows its certainty in both bars, so it is never unclear which source it sits with.
- Linked highlight, both ways: hovering a claim highlights its bars and the phrases they back; hovering or focusing a bar highlights it, its claim and those phrases. Every hover also works on focus. Claims are not Tab stops and there is no Sources chip; the bars are the controls.
- Opening: click, Enter or Space on a bar. Opening only removes the quotes, so nothing else moves: every other source stays in view as a bar without its quotes, and the open bar grows to hold the passage controls and the document, which scrolls inside it, scrolled to the cited passage, highlighted and focused. Escape or Close returns focus to the bar. The claim stays highlighted while its source is open.
- Narrow screens and high zoom (below 840px): the Sources panel moves under the claims. A source opens in place under its bar.

## Alternatives considered

- Citations in the claim text. First chosen as chips with a tooltip. Then rejected, because the chips cluttered the text and a chip can't hold enough information anyway. Then chosen as a small citation number after each backed phrase, linking to its source bar: the reviewer is a researcher who already knows citation markers from papers, so the number is familiar and makes the review smoother.
- Hover-only preview (chips with a tooltip). Rejected because it fails touch and keyboard users.
- Side-panel only. First rejected because it required a context switch for every claim. Then chosen instead of the margin cards, since we added every detail to each bar (badges, quotes, and the full passage when opened), which removes the context switch.
- Margin cards on the left plus a side panel on the right (the first version). Replaced because the two repeated the same badges, and the panel's open item could run over the bars below it.
- Panel on the left. Rejected because the claim is what the reviewer reads first; the evidence follows it in reading and Tab order.
- Reference list at the end. Rejected because the reviewer loses the claim while checking.
- One blended trust score. Rejected because it hides which check failed.

## Consequences

- Confidence is always visible; weak claims stand out right away. One click or Enter on a bar opens the full source in place, already scrolled to the exact passage. This works the same with a mouse, keyboard, touch screen or screen reader.
- Accessibility is ensured. A source can't appear without its trust badges, and each badge and quote appears once.
- With every source closed, the page fits a 1366×657 laptop window with no page scroll. With one open, the document gets the screen's spare height (at least about 34rem for the list), so at 1366×657 the page scrolls about 90px. The panel is 42rem wide on laptops and quotes use the small body size there.
- The badges can be misread. A "Badge key" sits at the top of the panel.
- This prototype uses fake data; it would need verifying with a real workflow and real data.
