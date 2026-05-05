## Goal
Make the "Create Course" button always look enabled, but on click validate the form. If invalid, scroll to the first missing field and show an inline error. Mark Course Title as mandatory.

## Changes — `src/components/Dashboard/CreateCourseDialog.tsx`

### 1. Remove disabled state from CTA
- Drop `disabled={!courseTitle.trim()}` on the Create Course `<Button>`.
- Button stays in primary enabled style at all times.

### 2. Add error state + refs
- New state: `titleError: string | null`, `aiError: string | null`.
- Refs: `titleInputRef` (input) and `aiSectionRef` (AIToggleRow wrapper) for scroll-into-view.
- Scrollable form container also gets a ref so we can scroll within the dialog (since the form area is the scroll container, not the window).

### 3. Mark Course Title as mandatory
- Append a red asterisk `<span aria-hidden="true" className="text-destructive ml-0.5">*</span>` to the "Course Title" label.
- Add `aria-required="true"` and `aria-invalid={!!titleError}` plus `aria-describedby="cc-title-error"` on the input.
- When `titleError` is set: input bottom border becomes `border-destructive` and replace the helper "💡 Used as the primary prompt..." line with the error message in `text-destructive` (id `cc-title-error`, `role="alert"`). Helper text returns once user starts typing.

### 4. Validate on click in `handleStartCreating`
Order of checks (first failure wins, so we can scroll to it):
1. Empty title → set `titleError = "Course title is required"`, focus + scroll `titleInputRef` into view (`block: "center"`), return.
2. AI enabled but config invalid (`!isAIConfigValid`) → set `aiError = "Complete AI configuration to continue"`, scroll `aiSectionRef` into view, also keep current behavior of opening `setShowAIConfig(true)` (after a short delay so user sees the highlight) — or simply open immediately; recommend: scroll + brief 250ms highlight, then open config view.
3. Otherwise clear errors and proceed (`setIsLoading(true)`).

### 5. Clear errors reactively
- `useEffect` on `courseTitle`: if non-empty, clear `titleError`.
- `useEffect` on `aiOptions`: if `isAIConfigValid`, clear `aiError`.
- `handleClose` resets both errors.

### 6. AI section error styling
- Wrap `<AIToggleRow>` in a div with `ref={aiSectionRef}`. When `aiError` is set, add a `ring-1 ring-destructive rounded-lg` around the wrapper and render an `aria-live="polite"` `<p className="text-xs text-destructive mt-1.5" role="alert">{aiError}</p>` underneath. No changes inside `AIToggleRow` itself.

### 7. Scrolling implementation detail
The form scroll container is the `<div className="flex-1 overflow-y-auto thin-scrollbar ...">`. Use `element.scrollIntoView({ behavior: "smooth", block: "center" })` on the target ref — works inside the nearest scrollable ancestor. After scroll, call `titleInputRef.current?.focus({ preventScroll: true })` for the title case.

## Accessibility
- Asterisk is decorative (`aria-hidden`); `aria-required` conveys requirement.
- Errors use `role="alert"` and are linked via `aria-describedby`.
- Button no longer has `disabled`, so screen readers won't announce it as disabled; validation feedback is announced via the live error region.

## Out of scope
- No changes to layout, AI config view internals, SCORM dialog, or routing/navigation behavior after a successful submit.
