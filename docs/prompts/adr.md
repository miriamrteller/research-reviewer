# Prompt: ADR

## 1. Goal

Write `docs/adr/<NNN>-ADR-<Topic>.md` recording the decision "<decision in one sentence>", status
Proposed.

## 2. Read first

- `docs/adr/TEMPLATE.md`: the layout to copy, section for section.
- `docs/adr/000-ADR-Accessibility.md`: the template's own record of the design system and the
  accessibility tests. Read it for length and tone only. Do not edit it and do not restate its
  decisions; where the new decision leans on it, cite it in one line in Context.
- `docs/research.md`, section "<heading>": the findings and the options this decision chose from.
- `README.md`, sections "Assumptions" and "In scope, out of scope".

## 3. Assumptions

- The user is <who>, doing <what>, under <constraint from the brief>.
- The decision is <decision>, because <the reason as dictated>.
- The alternatives were <A> and <B>. <A> was rejected because <reason as dictated>. <B> was
  rejected because <reason as dictated>.
- <Any rule from the README the decision must respect.>

## 4. Build

One file, `docs/adr/<NNN>-ADR-<Topic>.md`, with the next free three-digit number after `000`.
Sections exactly as in `TEMPLATE.md`: the Status line with today's date, Context with a Constraints
line, Decision as one sentence followed by parts specific enough to check in the code, Alternatives
considered with one concrete reason each, Consequences in the template's four lines. Link the
research section it draws on. No other file changes.

## 5. Exact copy

Title: `ADR <NNN>: <decision as a short sentence>`. Status: `Proposed · Date: <YYYY-MM-DD>`.

## 6. Tests

None. Prettier must pass on the file.

## 7. Out of scope

Editing `000-ADR-Accessibility.md` or `TEMPLATE.md`; any code; any second decision (it becomes a
paragraph in this ADR's consequences if it cannot wait).

## 8. Done when

`npm run verify` green and the README's "Design decisions" section links the new file.

## 9. Commit and log

Commit: `docs: ADR <NNN> <topic> (Proposed)`. AI log line: `ADR <NNN> (<name>'s decision): AI
drafted from the dictated decision and docs/research.md; <name> changed <what>.`
