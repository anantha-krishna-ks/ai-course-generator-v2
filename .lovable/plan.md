# Move Page Duration into Content Generation

You're right — page duration is a **content-generation** setting (how much content AI produces per page), not an LMS/SCORM behaviour. Right now it lives in two wrong places:

1. Inside the **SCORM Preferences** accordion on the blueprint step (`StepBlueprintGenerate.tsx`).
2. Inside the editor's **SCORM Preferences popover** as per-page overrides (`ScormPreferencesPopover.tsx`) — added last turn.

Both will be removed and rebuilt inside the AI generation flow.

## Changes

### 1. Blueprint step — new top-level "Page Duration" card
File: `src/components/AIGenerate/StepBlueprintGenerate.tsx`

- Remove the "Page Duration" block from `ScormPreferencesAccordion` (SCORM keeps only Background Image + other LMS options).
- Add a new top-level section card placed right after **Images** (before Tone/Font), styled like the other blueprint cards:
  - Header: icon (Clock) + title "Page duration" + description "Default time budget AI uses to size each page's content."
  - Minutes / seconds steppers (reusing the existing inputs).
- Keep the same state field for now (`scormPageDurationSec`) to avoid a rename ripple; label/help text reframed to content-generation wording.

### 2. Refine step — per-page duration overrides
File: `src/components/AIGenerate/StepEditRefine.tsx`

- Extend the local `Page` type with an optional `durationSec?: number` (undefined = inherits course default).
- On each page row, add a compact duration control on the right:
  - Shows `Default · Nm Ss` chip when inheriting, or `Nm Ss` in a bordered input when overridden.
  - Small pencil icon toggles into edit mode (minutes/seconds steppers).
  - Reset (RotateCcw) button appears when a custom value is set, reverts to inherit.
- Validation: any custom value must be ≥ 1 minute; block advancing (reuse existing next-button disabled pattern) with an inline error on the offending row.
- No styling changes to the surrounding section cards.

### 3. Revert SCORM popover
File: `src/components/CourseCreation/ScormPreferencesPopover.tsx`

- Remove the "Course default" card, per-page Default/Custom badges, `DurationInput`, reset buttons, and Done-button gating added last turn.
- Restore the file to its pre-duration state (background image + whatever else it originally had).

### Technical notes
- No new state fields on `AIGenerateState` — the existing `scormPageDurationSec` is reused as the course-default; renaming is a follow-up if you want.
- Per-page overrides live in `StepEditRefine`'s local `sections` state (same place page titles/types already live).
- Accessibility: number inputs get `aria-label`s, reset buttons get `aria-label="Reset to course default"`, chips use `role="status"` when showing inherited state.

## Out of scope
- Renaming `scormPageDurationSec` → `defaultPageDurationSec` across the codebase.
- Persisting per-page durations into the generated course/editor (currently the refine step is a pre-generation preview; wiring durations into the produced course data is a separate task — say the word if you want it in this pass).
