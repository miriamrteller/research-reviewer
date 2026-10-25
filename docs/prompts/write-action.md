# Prompt: write action

## 1. Goal

Add the <action name> action: the user confirms it, the mock API records who and when, and the
screen shows the <resulting state>.

## 2. Read first

- `src/screens/<ScreenName>.tsx` and `src/api/<resource>/`: the screen and resource this extends.
- `src/mocks/handlers/<resource>.ts`: add the new handler beside the GET.
- `src/components/ui/`: the Base UI dialog and button to use. Do not hand-roll a modal.
- `docs/adr/<NNN>-ADR-<Topic>.md`, section "Decision", and `README.md` "Assumptions".

## 3. Assumptions

- The action is <verb> on <entity>; it is the only way <state> changes.
- It needs confirmation: a dialog with "<title>", "<body>", buttons "<Confirm word>" and "Cancel".
- After it, the document is `<status value>`, read-only, and shows "<who> on <date and time>".
- Every user action records author and ISO timestamp (`UserAction { by, at }`).
- <Any precondition, such as unsaved edits blocking it.>

## 4. Build

- Schema: `status` union gains `'<value>'`; `<entity>` gains `<action>: UserAction` optional.
  Fixture stays in the starting state.
- Handler `POST <path>` with `applyScenario('POST <path>')`, `safeParse` on the body, returns the
  updated document; registered in `handlers/index.ts`.
- `use<Action>()` mutation, `retry: false`, `setQueryData` by the key factory on success.
- Button "<label>" on <where>; Base UI dialog; on success focus lands on <the status element>;
  on error the dialog shows `role="alert"` with "<error text>" and a Retry.
- Read-only state: controls disabled or hidden as the ADR says, status shown as icon + colour +
  word.

## 5. Exact copy

Button: "<label>". Dialog title: "<title>". Body: "<body>". Confirm: "<word>". Cancel: "Cancel".
Status after: "<Status word>". Error: "<error text>".

## 6. Tests

In `<ScreenName>.test.tsx`: "<does the action with confirmation and the page goes read-only>",
"<cancels and nothing changes>", "<sees the error and retries>", each using `requestLog` for the
request count where it matters, and an axe scan with the dialog open. e2e: `/?mock=down` for the
POST; keyboard spec gains the dialog path; screen-reader tree gains the dialog and status names.
Confirm dialog locators name the dialog, because the health toast is also `role="dialog"`.

## 7. Out of scope

<Other actions>; undo; versions; any layout change beyond the button and status.

## 8. Done when

`npm run verify` and `CI=1 npm run test:e2e` green; screenshots at <width> by <height> before,
with the dialog open, and after.

## 9. Commit and log

Commits: schema and handler; mutation and dialog; tests. AI log line: `<Action> (<name>'s
decision): AI added the confirmed action with author and timestamp; <name> changed <what>.`
