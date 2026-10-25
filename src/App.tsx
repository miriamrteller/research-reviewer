import { Toast } from '@base-ui/react/toast'
import { useRef } from 'react'
import { AssistChip, FilterChip, InputChip } from './components/Chip'
import { ConfirmDialog } from './components/ConfirmDialog'
import { TextAreaField } from './components/TextField'
import { Toaster } from './components/Toaster'
import { ApiHealthToast } from './screens/ApiHealthToast'

function App() {
  const titleRef = useRef<HTMLHeadingElement>(null)

  return (
    // No top bar: the screen is the whole page. The API's health is a toast in the bottom-left
    // corner, and theme and scheme are set from the URL (?theme=brand&scheme=dark).
    <Toast.Provider limit={1}>
      {/* Bottom padding lets the last controls scroll clear of the fixed health toast. */}
      <main className="mx-auto w-full max-w-[840px] px-4 pt-8 pb-24 sm:px-6">
        {/* The page's name for screen readers; sighted users see it in the tab title. */}
        <h1 ref={titleRef} tabIndex={-1} className="sr-only">
          Assignment18
        </h1>

        {/* The "paper": an elevated surface holding one document. No persistence yet. */}
        <form
          aria-labelledby="document-title"
          onSubmit={(event) => event.preventDefault()}
          className="grid gap-6 rounded-lg bg-surface-container-low p-6 shadow-elevation-1 sm:p-8"
        >
          <div className="grid gap-1">
            <h2 id="document-title" className="type-headline-medium">
              Project summary
            </h2>
            <p className="type-body-medium text-on-surface-variant">Draft · Last edited just now</p>
          </div>

          <fieldset className="grid gap-3 border-0 p-0">
            <legend className="type-label-large mb-2 text-on-surface-variant">Document type</legend>
            <div className="flex flex-wrap gap-2">
              <FilterChip selected>Report</FilterChip>
              <FilterChip>Proposal</FilterChip>
              <FilterChip>Specification</FilterChip>
              <FilterChip>Notes</FilterChip>
            </div>
          </fieldset>

          <TextAreaField
            id="summary"
            label="Summary"
            placeholder="Describe the goal, the audience and the key outcomes…"
            supportingText="Plain language. Avoid personal or confidential information."
          />

          <fieldset className="grid gap-2 border-0 p-0">
            <legend className="type-label-large mb-2 text-on-surface-variant">Tags</legend>
            <div className="flex flex-wrap gap-2">
              <InputChip label="Internal" />
              <InputChip label="Research" />
              <InputChip label="Follow-up" />
              <AssistChip>Add tag</AssistChip>
            </div>
          </fieldset>

          <div className="flex flex-wrap justify-end gap-2 border-t border-outline-variant pt-6">
            <ConfirmDialog
              triggerLabel="Cancel"
              triggerVariant="text"
              title="Discard changes?"
              description="Your edits to this summary will be lost. This cannot be undone."
              confirmLabel="Discard"
              cancelLabel="Keep editing"
            />
            <ConfirmDialog
              triggerLabel="Submit"
              title="Submit for review?"
              description="The summary will be locked and sent to the review queue."
              confirmLabel="Submit"
            />
          </div>
        </form>
      </main>

      <ApiHealthToast returnFocusTo={() => titleRef.current} />
      <Toaster />
    </Toast.Provider>
  )
}

export default App
