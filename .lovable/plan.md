## Goal

Replace the inline shimmer/skeleton loader inside `PageEditorDialog`'s AI-generation block with the new `CourseGenerationAnimation` spec — without changing the existing animation used by Dashboard `CreateCourseDialog`, `LoadingCourseProgressDialog`, or the full-screen `CreationLoader`.

## Approach

1. **Create a new, isolated component** `src/components/CourseCreation/PageEditorGenerationAnimation.tsx` that implements the spec exactly:
   - 200×200 SVG, `viewBox="0 0 200 200"`, `overflow-visible`, `aria-hidden="true"`, `focusable="false"`.
   - Wrapper `<div role="img" aria-label="Generating course content">` with optional `className` merged via `cn`.
   - All colors via HSL semantic tokens (`hsl(var(--primary))`, `hsl(var(--card))`, `hsl(var(--muted))`, `hsl(var(--muted-foreground) / 0.5)`, `hsl(var(--border))`, `hsl(var(--foreground) / 0.06)`).
   - Defs: `linearGradient#cga-page`, `linearGradient#cga-accent`, `filter#cga-soft` (feGaussianBlur stdDeviation=3, region -50% -50% 200% 200%).
   - Halo circle, floating page group with shadow + page rect + header/subheader, five animated text-line groups with the exact `{y, max, delay}` tuples, writing-cursor circle, orbiting sparkles group (14s), counter-rotating sparkles group (22s), and the `Sparkle` 8-point star helper.
   - Pure inline SMIL `<animate>` / `<animateTransform>`; no Lottie, framer-motion, or other deps.

2. **Swap it into `PageEditorDialog.tsx`** at the existing AI-generating branch (around lines 1241–1278):
   - Import the new component.
   - Replace the current skeleton shimmer block (gradient bg + skeleton lines + rotating ring + `AISparkles`) with a centered `<PageEditorGenerationAnimation />` (≈200×200) plus the existing status text ("Generating content…" / "This may take a moment").
   - Keep surrounding frame (`rounded-xl border border-primary/20 …`), padding, and the non-loading `<ContentBlock>` branch untouched.

3. **Leave the shared `CourseGenerationAnimation`** (books/cup) and its three current usages completely unchanged.

## Files

- New: `src/components/CourseCreation/PageEditorGenerationAnimation.tsx`
- Edited: `src/components/CourseCreation/PageEditorDialog.tsx` (only the AI generating branch)

## Out of scope

- No changes to Dashboard `CreateCourseDialog`, `LoadingCourseProgressDialog`, or `CreationLoader`.
- No changes to block types, AI workflow, or any business logic.
