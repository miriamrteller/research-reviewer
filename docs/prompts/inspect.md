# Prompt: inspect (read-only detail on the main flow)

## 1. Goal

Let the user inspect <the detail: badges, markers, highlight, an open state> on
`<src/components/Area/Component.tsx>`. Read-only: nothing is written, and the schema and the
container do not change.

## 2. Read first

- `<src/components/Area/Component.tsx>` and its test: the component this prompt extends.
- `src/api/<resource>/schema.ts`: the fields already there. Do not change it.
- `docs/adr/<NNN>-ADR-<Topic>.md`, section "Decision": the parts this layer renders.
- `src/components/ui/`: the primitives to use (Base UI for anything with keyboard behaviour).

## 3. Assumptions

- Each <item> shows <what>, as <icon + colour + word>, always visible, never behind hover.
- <Interaction>: on hover and on focus, <what highlights>; on Enter, Space or click, <what opens>;
  Escape <closes and returns focus to the trigger>.
- <State>: when <condition>, show "<text>" instead.
- Colours come from the <token names> pairs already tested; a new pair needs a contrast test.

## 4. Build

- `<Component>` gains <props>; new small components `<Badge>`, `<Marker>` under the same folder.
- Interaction state is local to the component or lifted one level, not to a store.
- Keyboard parity: every mouse action has a key; focus ring visible on every stop.

## 5. Exact copy

- Badge words: "<word>", "<word>", "<word>". Icon-only buttons: `aria-label` "<Open ... n>".
- Unavailable state: "<text>".
- <Every other visible string.>

## 6. Tests

Extend `<Component>.test.tsx` by role: "<sees the badges on every item>", "<opens an item and
reads it>", "<closes with Escape and focus returns>", plus an axe scan with an item open.
`e2e/keyboard.spec.ts` gains the open and close path. Screen-reader tree updated for the new names.

## 7. Out of scope

Schema, fixture, handler and container changes; any write; any new screen state; any sub flow; <the next prompt's feature>.

## 8. Done when

`npm run verify` and `CI=1 npm run test:e2e` green; two screenshots at <width> by <height>: closed
and with one item open, no page scroll in either.

## 9. Commit and log

Commits: rendering; interaction; tests. AI log line: `<Detail> (<name>'s decision): AI added
<what> to <Component>; <name> changed <what>.`
