# Info Card: floating toolbar + premium corner fold

Two focused changes to `src/components/CourseCreation/LayoutUtilityBlock.tsx` (the `InfoCard` component). No other files or business logic touched.

## 1. Rich-text toolbar on the body

Reuse the CardSortBlock toolbar pattern (floating pill, arrow tail, `execCommand`, mousedown-preserve-focus) inside the Info Card body editor.

- Replace the current textarea + "click-to-edit" button with a single `contentEditable` div that keeps the same look (auto-grow, placeholder, `text-foreground/90` body copy).
- Sanitize with the existing `sanitizeCardHtml` helper so only Bold / Italic / Underline / Strikethrough / links are allowed — same allow-list as CardSortBlock.
- Store the sanitized HTML in the existing `body` field (`commit({ body })`). Read-only mode renders it with `dangerouslySetInnerHTML` through the same sanitizer.
- Toolbar appears above the card body only while focused, tinted with the active preset's `accent` on the divider dot so it feels tied to the card. Buttons: Bold, Italic, Underline, Strikethrough, divider, Clear formatting — identical order to CardSortBlock so muscle memory transfers.
- Preserve accessibility: `role="toolbar"`, `aria-label="Text formatting"`, `aria-label` on the editable region, keyboard-reachable buttons, `onMouseDown` preventDefault so the selection isn't lost.

## 2. Redesigned top-right corner "fold"

Replace the current flat triangle (lines 617–629) with a layered dog-ear that reads as a real folded paper corner:

- Larger corner (≈40×40) clipped to the card's `borderTopRightRadius` so it hugs the rounded corner.
- Three stacked layers:
  1. **Under-shadow** — soft radial shadow bleeding down-left from the fold to imply lift.
  2. **Fold face** — diagonal gradient from `preset.fold` → `hsl(0 0% 100% / 0.85)`, giving it a subtle sheen instead of a flat tint.
  3. **Crease highlight** — 1px diagonal line along the fold edge in `preset.accent / 0.35` for definition.
- Add a faint inner "peeked" corner behind the fold using `preset.bg` darkened ~6% so you can sense the page beneath.
- Keep it `aria-hidden`, pointer-events-none, and honor `prefers-reduced-motion` (no animation needed — this is static).
- Match the fold size/position responsively (a hair larger on `sm:` breakpoint) so it stays proportional to the card padding.

## Technical notes

- No new dependencies. `sanitizeCardHtml` and DOMPurify are already imported elsewhere; import `sanitizeCardHtml` from `CardSortBlock` or lift it to `src/lib/sanitize.ts` if it isn't already exported — prefer lifting to a shared util to avoid a component-to-component import.
- Reuse `RtButton` by exporting it from `CardSortBlock` or inlining a small local twin; lifting to a shared file (`src/components/CourseCreation/RichTextToolbarButton.tsx`) is cleaner and lets other blocks reuse it later.
- Read-only path renders sanitized HTML; empty body still shows the italic placeholder exactly like today.
- No changes to the type picker, popover "Change" menu, icon medallion, or preset colors.

## Verification

- Focus the body → toolbar appears above; Bold/Italic/Underline/Strike apply to selection; Clear formatting strips them; blur commits and re-renders the same HTML.
- Switch preset kinds → fold color updates and the new layered fold still clips cleanly to the rounded corner in each of the 6 flavours.
- Read-only preview page shows formatted HTML with no toolbar.
