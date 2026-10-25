# ADR NNN: <decision as a short sentence>

Status: Proposed | Accepted | Superseded by NNN · Date: YYYY-MM-DD

Copy this file to `docs/adr/NNN-ADR-<Topic>.md` with the next free three-digit number (the
template keeps `000`). Read `000-ADR-Accessibility.md` for length and tone only; never edit it or
restate its decisions, cite it in one line in Context where a new decision leans on it. A good
topic is a choice with alternatives you
actually rejected. "We used React" is not an ADR.

## Context

The problem that forced the decision, in three to five sentences. Name the constraint from the
brief that makes it matter.

Constraints: <scope, users, time, what is mocked>.

## Decision

<One sentence: what was decided.>

- <Part>: <what it is, specific enough to check in the code>.
- <Part>: <…>.

## Alternatives considered

- <Alternative A>. Rejected because <one concrete reason>.
- <Alternative B>. Rejected because <one concrete reason>.

## Consequences

- What becomes easier or safer: <…>
- What the codebase now guarantees: <…>
- What becomes harder, or what the prototype mocks that a real system would need: <…>
- What a reviewer should watch for: <…>
