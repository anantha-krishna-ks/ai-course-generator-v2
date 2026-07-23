Bring the new **Page duration** pattern (default + per-page overrides) to both flows.

## 1. Step-by-step creation (`StepCourseDetails.tsx`)
- Replace the existing `PageDurationStepper` block (around line 466–478) with the new **Page duration** card used in Blueprint (label, mins:secs inputs, description).
- On the pages list (the section where users add/remove pages, ~line 500+), append a small clock **duration pill** to each page row.
  - Pill shows current duration and **Default** / **Custom** state.
  - Popover editor with mins/secs inputs, min 1 minute validation, and **Use default** reset.
- Reuse `scormPageDurationSec` from `AIGenerateState` as the default; store per-page overrides in a local `Record<pageId, sec>` map (same shape as `StepEditRefine`).

## 2. Document to course
- **`StepDocumentPreferences.tsx`**: add the same **Page duration** default card as a new preference section (near other preference cards).
- **`StepDocumentAssessment.tsx`** (or wherever the generated page outline is shown for review — confirm during build): add the per-page duration pill on each page row, with the same popover + reset behavior.
- If a page outline list doesn't exist in that step, add overrides only in the Refine step already shared with AI flow.

## 3. Shared helper
- Extract `PageDurationPill` and `formatDuration` from `StepEditRefine.tsx` into `src/components/AIGenerate/PageDurationPill.tsx` and import from all three flows to avoid duplication.
- Extract the default-duration card into `PageDurationDefaultCard.tsx` for reuse in Blueprint, Step-by-step, and Document Preferences.

## 4. Consistency
- Same labels ("Page duration", "Default", "Custom", "Use default (Xm Ys)").
- Same 1-minute minimum validation.
- Not under SCORM anywhere.

## Files to edit
- `src/components/AIGenerate/StepCourseDetails.tsx`
- `src/components/AIGenerate/StepDocumentPreferences.tsx`
- `src/components/AIGenerate/StepDocumentAssessment.tsx` (per-page pills, if outline present)
- `src/components/AIGenerate/StepBlueprintGenerate.tsx` (switch to shared components)
- `src/components/AIGenerate/StepEditRefine.tsx` (switch to shared components)
- New: `src/components/AIGenerate/PageDurationPill.tsx`, `src/components/AIGenerate/PageDurationDefaultCard.tsx`